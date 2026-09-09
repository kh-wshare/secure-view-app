import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { User } from '@/types/domain';
import { login, logout, register } from '@/services/api/auth.api';
import { getMe } from '@/services/api/users.api';
import {
  ensureFreshAccessToken,
  getSession,
  loadSession,
  onSessionExpired,
} from '@/services/api/session';
import { useCameraStore } from '@/store/useCameraStore';
import { useEventStore } from '@/store/useEventStore';
import { useNotificationStore } from '@/store/useNotificationStore';

export type AuthStatus = 'loading' | 'signedIn' | 'signedOut';

type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function resetDomainStores() {
  useCameraStore.getState().reset();
  useEventStore.getState().reset();
  useNotificationStore.getState().reset();
}

/**
 * Owns session bootstrap (restore + refresh the stored session on cold
 * start), sign-in/up/out, and reacts to a session dying mid-app (refresh
 * token rejected — see `onSessionExpired` in services/api/session.ts) by
 * dropping back to signed-out and clearing every domain store so the next
 * account never sees stale data from the previous one.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      await useCameraStore.getState().loadFavorites();
      const session = await loadSession();
      if (!session) {
        if (!cancelled) setStatus('signedOut');
        return;
      }
      try {
        const token = await ensureFreshAccessToken();
        if (!token) throw new Error('Session could not be refreshed');
        const me = await getMe();
        if (!cancelled) {
          setUser(me);
          setStatus('signedIn');
        }
      } catch {
        if (!cancelled) setStatus('signedOut');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(
    () =>
      onSessionExpired(() => {
        resetDomainStores();
        setUser(null);
        setStatus('signedOut');
      }),
    [],
  );

  const signIn = useCallback(async (email: string, password: string) => {
    const me = await login({ email, password });
    setUser(me);
    setStatus('signedIn');
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      await register({ email, password, name });
      await signIn(email, password);
    },
    [signIn],
  );

  const signOut = useCallback(async () => {
    const session = getSession();
    if (session) {
      await logout(session.refreshToken);
    }
    resetDomainStores();
    setUser(null);
    setStatus('signedOut');
  }, []);

  const value = useMemo(
    () => ({ status, user, signIn, signUp, signOut }),
    [status, user, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
