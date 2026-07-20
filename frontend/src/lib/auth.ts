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

export async function checkAuth(): Promise<AuthState> {
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
