import React, { useMemo } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { HeroUINativeProvider } from 'heroui-native';
import { ThemeProvider, useTheme } from '@/theme';
import { AuthProvider } from '@/core/auth/AuthContext';

function StatusBarBridge() {
  const { mode } = useTheme();
  return <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />;
}

/**
 * Root provider stack. Order matters:
 * - GestureHandlerRootView + SafeAreaProvider must wrap everything
 *   (navigation, reanimated gestures, and HeroUINativeProvider's internal
 *   SafeAreaListener all depend on them).
 * - ThemeProvider owns dark/light mode and pushes it into Uniwind (see
 *   src/theme/ThemeProvider.tsx) — it must be an ancestor of
 *   HeroUINativeProvider so HeroUI Native components pick up the same mode.
 * - HeroUINativeProvider wraps `children` (not just a leaf) because it also
 *   renders the PortalHost that Dialog/Toast/Popover mount into.
 * - AuthProvider sits inside QueryClientProvider (it doesn't use React Query
 *   itself today, but session bootstrap is exactly the kind of thing that
 *   could move there) and wraps `children` so RootNavigator can read auth
 *   status to decide between the Auth stack and the main tabs.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
      }),
    [],
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <StatusBarBridge />
            <AuthProvider>
              <HeroUINativeProvider>{children}</HeroUINativeProvider>
            </AuthProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
