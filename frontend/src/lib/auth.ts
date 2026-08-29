const API_BASE = import.meta.env.VITE_API_BASE ?? '/api'

export interface AuthUser {
  id: string
  username: string
  email: string | null
  role: string
}

export type AuthState =
  | { status: 'checking' }
  | { status: 'authenticated'; user: AuthUser }
  | { status: 'anonymous' }
  /* SSO desactivado: la app es de acceso libre y no se pide identidad. */
  | { status: 'open' }

export async function checkAuth(): Promise<AuthState> {
  /*
   * El laboratorio es de acceso libre por diseño. El SSO solo existe para que
   * el profesorado pueda llevar un registro propio de uso, así que cuando no
   * está configurado no tiene sentido exigir una sesión que el backend
   * tampoco va a validar: eso dejaba la app tras un muro sin llave.
   */
  try {
    const config = await fetch(`${API_BASE}/auth/config`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    })
    if (config.ok) {
      const payload = (await config.json()) as { sso_enabled?: boolean }
      if (!payload.sso_enabled) return { status: 'open' }
    }
  } catch {
    /* Si la config no responde, seguimos con la comprobación de sesión. */
  }

  try {
    const response = await fetch(`${API_BASE}/auth/me`, {
      credentials: 'include',
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    })
    if (!response.ok) return { status: 'anonymous' }
    const payload = (await response.json()) as { user: AuthUser }
    return { status: 'authenticated', user: payload.user }
  } catch {
    return { status: 'anonymous' }
  }
}

export function loginUrl(): string {
  const next = `${window.location.pathname}${window.location.search}`
  return `${API_BASE}/auth/oidc/start?next=${encodeURIComponent(next)}`
}

export function logoutUrl(): string {
  return `${API_BASE}/auth/logout`
}
