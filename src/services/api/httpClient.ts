import { API_BASE_URL } from './config';
import { ApiError } from './ApiError';
import { clearSession, ensureFreshAccessToken, onSessionExpired } from './session';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Attaches `Authorization: Bearer <access_token>`. Default true. */
  auth?: boolean;
  /** Extra headers, merged on top of the defaults (e.g. HMAC headers for the Internal/Devices surface). */
  headers?: Record<string, string>;
};

async function parseBody(res: Response): Promise<unknown> {
  if (res.status === 204) return null;
  const text = await res.text();
  if (!text) return null;
  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('json')) return text;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Fetch wrapper for the Go control plane (`/api/v1/*`). Attaches the bearer
 * token, refreshes it proactively when it's stale, retries once on a 401
 * (in case the token expired between the freshness check and the send), and
 * throws `ApiError` using the API's `{error:{code,message}}` envelope.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true, headers = {} } = options;

  const send = async (): Promise<Response> => {
    const finalHeaders: Record<string, string> = { ...headers };
    if (body !== undefined) finalHeaders['Content-Type'] = 'application/json';

    if (auth) {
      const token = await ensureFreshAccessToken();
      if (token) finalHeaders.Authorization = `Bearer ${token}`;
    }

    return fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  };

  let res = await send();

  if (res.status === 401 && auth) {
    // Token may have lapsed between the freshness check and the send, or the
    // very first request after a cold start raced session hydration. Force
    // one more refresh attempt before giving up.
    const token = await ensureFreshAccessToken();
    if (token) {
      res = await send();
    }
  }

  const json = await parseBody(res);

  if (!res.ok) {
    const envelope = json as { error?: { code?: string; message?: string } } | null;
    const code = envelope?.error?.code ?? 'unknown_error';
    const message = envelope?.error?.message ?? `Request failed with status ${res.status}`;
    if (res.status === 401 && auth) {
      await clearSession();
    }
    throw new ApiError(res.status, code, message);
  }

  return json as T;
}

export { onSessionExpired };
