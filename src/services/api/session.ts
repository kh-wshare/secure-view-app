import { API_BASE_URL } from './config';
import { ApiError } from './ApiError';
import {
  clearStoredSession,
  loadStoredSession,
  saveStoredSession,
  type StoredSession,
} from './tokenStorage';

/**
 * In-memory mirror of the persisted session so every request doesn't need an
 * async SecureStore read. `loadSession()` populates this once at app boot
 * (see AuthContext); everything else in the api layer reads/writes through
 * here so the two never drift.
 */
let current: StoredSession | null = null;
let expiredListeners: Array<() => void> = [];

export function onSessionExpired(listener: () => void): () => void {
  expiredListeners.push(listener);
  return () => {
    expiredListeners = expiredListeners.filter((l) => l !== listener);
  };
}

function notifyExpired() {
  expiredListeners.forEach((l) => l());
}

export async function loadSession(): Promise<StoredSession | null> {
  current = await loadStoredSession();
  return current;
}

export function getSession(): StoredSession | null {
  return current;
}

export async function setSession(session: StoredSession): Promise<void> {
  current = session;
  await saveStoredSession(session);
}

export async function clearSession(): Promise<void> {
  current = null;
  await clearStoredSession();
}

const REFRESH_SLACK_MS = 60_000;

function isFresh(session: StoredSession): boolean {
  const expiresAt = Date.parse(session.accessExpiresAt);
  return Number.isFinite(expiresAt) && expiresAt - Date.now() > REFRESH_SLACK_MS;
}

async function rawRefresh(refreshToken: string): Promise<StoredSession> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const code = json?.error?.code ?? 'unknown_error';
    const message = json?.error?.message ?? 'Failed to refresh session';
    throw new ApiError(res.status, code, message);
  }
  return {
    accessToken: json.access_token,
    accessExpiresAt: json.access_expires_at,
    refreshToken: json.refresh_token,
  };
}

let refreshInFlight: Promise<string | null> | null = null;

/**
 * Returns a usable access token, refreshing first if it's missing or within
 * 60s of expiring (mirrors the Postman collection's pre-request auto-login
 * script). Concurrent callers share one in-flight refresh so a burst of
 * requests firing right as the token lapses doesn't rotate the refresh token
 * multiple times (each rotation invalidates the previous one).
 */
export async function ensureFreshAccessToken(): Promise<string | null> {
  if (!current) return null;
  if (isFresh(current)) return current.accessToken;

  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const refreshed = await rawRefresh(current!.refreshToken);
        await setSession(refreshed);
        return refreshed.accessToken;
      } catch {
        await clearSession();
        notifyExpired();
        return null;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}
