import { apiRequest } from './httpClient';
import { clearSession, setSession } from './session';
import type { ApiAuthResponse, ApiUser } from './types';
import { mapApiUser } from './mappers';
import type { User } from '@/types/domain';

export async function register(input: {
  email: string;
  password: string;
  name: string;
}): Promise<User> {
  const user = await apiRequest<ApiUser>('/api/v1/auth/register', {
    method: 'POST',
    auth: false,
    body: input,
  });
  return mapApiUser(user);
}

async function persistAuthResponse(res: ApiAuthResponse): Promise<User> {
  await setSession({
    accessToken: res.access_token,
    accessExpiresAt: res.access_expires_at,
    refreshToken: res.refresh_token,
  });
  return mapApiUser(res.user);
}

export async function login(input: { email: string; password: string }): Promise<User> {
  const res = await apiRequest<ApiAuthResponse>('/api/v1/auth/login', {
    method: 'POST',
    auth: false,
    body: input,
  });
  return persistAuthResponse(res);
}

export async function logout(refreshToken: string): Promise<void> {
  try {
    await apiRequest('/api/v1/auth/logout', {
      method: 'POST',
      auth: false,
      body: { refresh_token: refreshToken },
    });
  } catch {
    // Best-effort — the local session is cleared regardless below, so
    // signing out still works while offline or if the server rejects the
    // revoke call; the refresh token simply expires naturally server-side.
  } finally {
    await clearSession();
  }
}
