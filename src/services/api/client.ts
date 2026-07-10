import type { User } from '../../types'

export const API_URL = import.meta.env.VITE_API_URL as string | undefined
export const TOKEN_KEY = 'nutri.token.v1'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

let onUnauthorized: (() => void) | null = null
/** Called on any 401 outside /auth — the service clears the session. */
export function setOnUnauthorized(handler: () => void) {
  onUnauthorized = handler
}

export async function api<T>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY)
  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: opts.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    })
  } catch {
    throw new ApiError(0, 'You appear to be offline')
  }
  if (res.status === 401 && !path.startsWith('/auth/')) {
    onUnauthorized?.()
    throw new ApiError(401, 'Session expired — please log in again')
  }
  if (!res.ok) {
    let message = 'Something went wrong'
    try {
      message = ((await res.json()) as { error?: string }).error ?? message
    } catch {
      // non-JSON error body — keep the generic message
    }
    throw new ApiError(res.status, message)
  }
  return (res.status === 204 ? undefined : await res.json()) as T
}

export interface ApiFood {
  id: string
  name: string
  emoji: string
  tint: string
  iconId: string
  usualMeal: string
  calories: number
  carbs: number
  protein: number
  fats: number
  fiber: number
  portionUnit: string
}

export interface AuthResponse {
  token: string
  user: User
}
