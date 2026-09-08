import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { Uniwind } from 'uniwind';
import { buildThemeColors, ThemeColors } from './colors';
import { spacing } from './spacing';
import { radii } from './radii';
import { fontFamily, fontSize, textStyles } from './typography';

type ThemeMode = 'dark' | 'light';

type ThemeContextValue = {
  mode: ThemeMode;
  colors: ThemeColors;
  spacing: typeof spacing;
  radii: typeof radii;
  fontFamily: typeof fontFamily;
  fontSize: typeof fontSize;
  textStyles: typeof textStyles;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
};

const STORAGE_KEY = 'secureview.themeMode';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * App-wide theme provider. Dark is the default. The Profile screen's
 * "Dark mode" toggle calls setMode()/toggleMode() from useTheme() and the
 * whole app re-renders with the new palette immediately.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('dark');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'dark' || stored === 'light') {
        setModeState(stored);
      } else {
        const system = Appearance.getColorScheme();
        setModeState(system === 'light' ? 'light' : 'dark');
      }
    });
  }, []);

  // Keep HeroUI Native / Uniwind's theme (src/global.css's `light`/`dark`
  // variants) in lockstep with our own mode state, which stays the single
  // source of truth (persisted here via AsyncStorage, toggled from
  // Profile). Without this, HeroUI-styled components would follow the OS
  // appearance instead of the app's explicit dark/light choice.
  useEffect(() => {
    Uniwind.setTheme(mode);
  }, [mode]);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((prev) => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
      AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      colors: buildThemeColors(mode),
      spacing,
      radii,
      fontFamily,
      fontSize,
      textStyles,
      toggleMode,
      setMode,
    }),
    [mode, setMode, toggleMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme() must be used within <ThemeProvider>');
  return ctx;
}
