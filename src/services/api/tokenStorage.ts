import * as SecureStore from 'expo-secure-store';

export type StoredSession = {
  accessToken: string;
  accessExpiresAt: string;
  refreshToken: string;
};

const KEY = 'secureview.session';

/**
 * Tokens live in SecureStore (Keychain/Keystore-backed), not AsyncStorage —
 * this is credential material, not app preferences.
 */
export async function loadStoredSession(): Promise<StoredSession | null> {
  const raw = await SecureStore.getItemAsync(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

export async function saveStoredSession(session: StoredSession): Promise<void> {
  await SecureStore.setItemAsync(KEY, JSON.stringify(session));
}

export async function clearStoredSession(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY);
}
