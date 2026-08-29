"""
Authentik OIDC integration for EDUmind Robotics.

The browser only receives a signed, HttpOnly application session. OAuth tokens
remain in the backend and are discarded after the identity has been verified.
"""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import secrets
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from urllib.parse import urlencode

import httpx
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Request, Response, status
from fastapi.responses import RedirectResponse
from jose import JWTError, jwt


# Authentication must load the same private environment even when imported by
# a CLI command, background worker or isolated test helper before app.main.
load_dotenv(Path(__file__).resolve().parents[2] / ".env")


@dataclass(frozen=True)
class AuthSettings:
    enabled: bool
    app_base_url: str
    issuer_url: str | None
    client_id: str | None
    client_secret: str | None
    scopes: str
    session_cookie_name: str
    session_secret: str
    session_max_age: int

    @classmethod
    def from_env(cls) -> "AuthSettings":
        enabled = os.getenv("AUTHENTIK_ENABLED", "false").lower() == "true"
        app_base_url = os.getenv("APP_BASE_URL", "http://localhost:5173").rstrip("/")
        session_secret = os.getenv("SESSION_SECRET", "")

        if enabled:
            missing = [
                name
                for name, value in {
                    "AUTHENTIK_ISSUER_URL": os.getenv("AUTHENTIK_ISSUER_URL"),
                    "AUTHENTIK_CLIENT_ID": os.getenv("AUTHENTIK_CLIENT_ID"),
                    "AUTHENTIK_CLIENT_SECRET": os.getenv("AUTHENTIK_CLIENT_SECRET"),
                    "SESSION_SECRET": session_secret,
                }.items()
                if not value
            ]
            if missing:
                raise RuntimeError(f"Incomplete Authentik configuration: {', '.join(missing)}")
            if len(session_secret) < 64:
                raise RuntimeError("SESSION_SECRET must contain at least 64 random characters")

        return cls(
            enabled=enabled,
            app_base_url=app_base_url,
            issuer_url=os.getenv("AUTHENTIK_ISSUER_URL", "").rstrip("/") or None,
            client_id=os.getenv("AUTHENTIK_CLIENT_ID") or None,
            client_secret=os.getenv("AUTHENTIK_CLIENT_SECRET") or None,
            scopes=os.getenv("AUTHENTIK_SCOPES", "openid profile email"),
            session_cookie_name=os.getenv(
                "SESSION_COOKIE_NAME", "edumind_robotics_session"
            ),
            session_secret=session_secret or "development-only-session-secret",
            session_max_age=int(os.getenv("SESSION_MAX_AGE_SECONDS", str(8 * 24 * 3600))),
        )

    @property
    def secure_cookies(self) -> bool:
        return self.app_base_url.startswith("https://")

    @property
    def callback_url(self) -> str:
        return f"{self.app_base_url}/api/auth/oidc/callback"


settings = AuthSettings.from_env()
router = APIRouter(prefix="/api/auth", tags=["Authentication"])

_metadata_cache: tuple[float, dict[str, Any]] | None = None
_jwks_cache: tuple[float, dict[str, Any]] | None = None
_CACHE_SECONDS = 600
_OIDC_COOKIE_SECONDS = 600


def _base64url_encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).rstrip(b"=").decode("ascii")


def _base64url_decode(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))


def _safe_next(value: str | None) -> str:
    if not value:
        return "/"
    candidate = value.strip()
    if (
        not candidate.startswith("/")
        or candidate.startswith("//")
        or candidate.startswith("/api/")
    ):
        return "/"
    return candidate


def _cookie_options(max_age: int) -> dict[str, Any]:
    return {
        "max_age": max_age,
        "httponly": True,
        "secure": settings.secure_cookies,
        "samesite": "lax",
        "path": "/",
    }


def _set_cookie(response: Response, name: str, value: str, max_age: int) -> None:
    response.set_cookie(name, value, **_cookie_options(max_age))


def _clear_cookie(response: Response, name: str) -> None:
    response.delete_cookie(
        name,
        path="/",
        secure=settings.secure_cookies,
        httponly=True,
        samesite="lax",
    )


def sign_session(user: dict[str, Any]) -> str:
    now = int(time.time())
    payload = {
        "id": str(user["id"]),
        "username": str(user["username"]),
        "email": user.get("email"),
        "role": str(user.get("role") or "user"),
        "iat": now,
        "exp": now + settings.session_max_age,
    }
    encoded = _base64url_encode(
        json.dumps(payload, separators=(",", ":"), ensure_ascii=True).encode()
    )
    signature = hmac.new(
        settings.session_secret.encode(), encoded.encode(), hashlib.sha256
    ).digest()
    return f"{encoded}.{_base64url_encode(signature)}"


def verify_session(value: str | None) -> dict[str, Any] | None:
    if not value:
        return None
    try:
        encoded, signature = value.split(".", 1)
        expected = hmac.new(
            settings.session_secret.encode(), encoded.encode(), hashlib.sha256
        ).digest()
        if not hmac.compare_digest(expected, _base64url_decode(signature)):
            return None
        payload = json.loads(_base64url_decode(encoded))
        if int(payload.get("exp", 0)) < int(time.time()):
            return None
        return {
            "id": str(payload["id"]),
            "username": str(payload["username"]),
            "email": payload.get("email"),
            "role": str(payload.get("role") or "user"),
        }
    except (KeyError, TypeError, ValueError, json.JSONDecodeError):
        return None


def user_from_request(request: Request) -> dict[str, Any] | None:
    return verify_session(request.cookies.get(settings.session_cookie_name))


def _require_oidc() -> None:
    if not settings.enabled:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="EDUmind SSO is not enabled in this environment",
        )


async def _fetch_json(method: str, url: str, **kwargs: Any) -> dict[str, Any]:
    try:
        async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
            response = await client.request(method, url, **kwargs)
            response.raise_for_status()
            return response.json()
    except (httpx.HTTPError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The EDUmind identity provider could not be reached",
        ) from exc


async def _metadata() -> dict[str, Any]:
    _require_oidc()
    global _metadata_cache
    now = time.time()
    if _metadata_cache and _metadata_cache[0] > now:
        return _metadata_cache[1]
    payload = await _fetch_json(
        "GET", f"{settings.issuer_url}/.well-known/openid-configuration"
    )
    if payload.get("issuer", "").rstrip("/") != settings.issuer_url:
        raise HTTPException(status_code=502, detail="Unexpected OIDC issuer")
    _metadata_cache = (now + _CACHE_SECONDS, payload)
    return payload


async def _jwks(metadata: dict[str, Any]) -> dict[str, Any]:
    global _jwks_cache
    now = time.time()
    if _jwks_cache and _jwks_cache[0] > now:
        return _jwks_cache[1]
    if not metadata.get("jwks_uri"):
        raise HTTPException(status_code=502, detail="OIDC metadata has no JWKS URI")
    payload = await _fetch_json("GET", metadata["jwks_uri"])
    _jwks_cache = (now + _CACHE_SECONDS, payload)
    return payload


async def _validate_id_token(
    id_token: str, nonce: str, metadata: dict[str, Any]
) -> dict[str, Any]:
    try:
        header = jwt.get_unverified_header(id_token)
        algorithm = header.get("alg")
        key_id = header.get("kid")
        if not algorithm or str(algorithm).lower() == "none":
            raise JWTError("Invalid signing algorithm")
        keys = (await _jwks(metadata)).get("keys", [])
        signing_key = next(
            (key for key in keys if key_id is None or key.get("kid") == key_id), None
        )
        if not signing_key:
            raise JWTError("Signing key not found")
        claims = jwt.decode(
            id_token,
            signing_key,
            algorithms=[algorithm],
            audience=settings.client_id,
            issuer=metadata["issuer"],
        )
        if claims.get("nonce") != nonce:
            raise JWTError("Invalid nonce")
        return claims
    except (JWTError, KeyError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="The EDUmind identity response could not be verified",
        ) from exc


def _role_from_claims(claims: dict[str, Any]) -> str:
    groups = claims.get("groups") or []
    if isinstance(groups, str):
        groups = [groups]
    priorities = (
        ("edumind-admin", "admin"),
        ("edumind-teacher-premium", "teacher-premium"),
        ("edumind-teacher", "teacher"),
        ("edumind-family", "family"),
        ("edumind-student", "student"),
    )
    return next((role for group, role in priorities if group in groups), "user")


def _user_from_claims(claims: dict[str, Any]) -> dict[str, Any]:
    subject = claims.get("sub")
    if not subject:
        raise HTTPException(status_code=502, detail="OIDC profile has no subject")
    username = (
        claims.get("preferred_username")
        or claims.get("name")
        or claims.get("email")
        or subject
    )
    return {
        "id": str(subject),
        "username": str(username),
        "email": claims.get("email"),
        "role": _role_from_claims(claims),
    }


@router.get("/config")
async def auth_config() -> dict[str, Any]:
    return {
        "auth_mode": "authentik" if settings.enabled else "local",
        "sso_enabled": settings.enabled,
        "sso_provider": "authentik" if settings.enabled else None,
        "sso_login_path": "/api/auth/oidc/start" if settings.enabled else None,
    }


@router.get("/me")
async def auth_me(request: Request) -> dict[str, Any]:
    user = user_from_request(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {"user": user}


@router.get("/oidc/start")
async def oidc_start(request: Request, next: str | None = None) -> RedirectResponse:
    metadata = await _metadata()
    state = secrets.token_urlsafe(32)
    nonce = secrets.token_urlsafe(32)
    verifier = secrets.token_urlsafe(64)
    challenge = _base64url_encode(hashlib.sha256(verifier.encode()).digest())
    params = urlencode(
        {
            "client_id": settings.client_id,
            "response_type": "code",
            "redirect_uri": settings.callback_url,
            "scope": settings.scopes,
            "state": state,
            "nonce": nonce,
            "code_challenge": challenge,
            "code_challenge_method": "S256",
        }
    )
    response = RedirectResponse(f"{metadata['authorization_endpoint']}?{params}")
    prefix = f"{settings.session_cookie_name}_oidc"
    _set_cookie(response, f"{prefix}_state", state, _OIDC_COOKIE_SECONDS)
    _set_cookie(response, f"{prefix}_nonce", nonce, _OIDC_COOKIE_SECONDS)
    _set_cookie(response, f"{prefix}_verifier", verifier, _OIDC_COOKIE_SECONDS)
    _set_cookie(response, f"{prefix}_next", _safe_next(next), _OIDC_COOKIE_SECONDS)
    return response


@router.get("/oidc/callback")
async def oidc_callback(
    request: Request,
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
) -> RedirectResponse:
    prefix = f"{settings.session_cookie_name}_oidc"
    expected_state = request.cookies.get(f"{prefix}_state")
    nonce = request.cookies.get(f"{prefix}_nonce")
    verifier = request.cookies.get(f"{prefix}_verifier")
    next_path = _safe_next(request.cookies.get(f"{prefix}_next"))

    if error or not code or not state or not hmac.compare_digest(
        state, expected_state or ""
    ):
        response = RedirectResponse("/?auth_error=1")
    elif not nonce or not verifier:
        response = RedirectResponse("/?auth_error=1")
    else:
        metadata = await _metadata()
        tokens = await _fetch_json(
            "POST",
            metadata["token_endpoint"],
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": settings.callback_url,
                "client_id": settings.client_id,
                "client_secret": settings.client_secret,
                "code_verifier": verifier,
            },
        )
        id_token = tokens.get("id_token")
        if not id_token:
            raise HTTPException(status_code=502, detail="OIDC response has no ID token")
        claims = await _validate_id_token(id_token, nonce, metadata)
        user = _user_from_claims(claims)
        response = RedirectResponse(next_path)
        _set_cookie(
            response,
            settings.session_cookie_name,
            sign_session(user),
            settings.session_max_age,
        )

    for suffix in ("state", "nonce", "verifier", "next"):
        _clear_cookie(response, f"{prefix}_{suffix}")
    return response


@router.get("/logout")
async def logout() -> RedirectResponse:
    response = RedirectResponse("/")
    _clear_cookie(response, settings.session_cookie_name)
    if settings.enabled:
        try:
            metadata = await _metadata()
            end_session = metadata.get("end_session_endpoint")
            if end_session:
                response.headers["location"] = (
                    f"{end_session}?"
                    + urlencode(
                        {
                            "client_id": settings.client_id,
                            "post_logout_redirect_uri": settings.app_base_url,
                        }
                    )
                )
        except HTTPException:
            pass
    return response
