/**
 * Color tokens for SecureView.
 * Dark is the default/primary theme (this is a video-first, dark-optimized app);
 * light is fully supported and switched via ThemeProvider.
 *
 * Never import raw hex values into a screen/component — always read colors
 * from `useTheme()` so both themes stay correct automatically.
 */

export const palette = {
  darkBg: '#0A0E12',
  darkBgElevated: '#12171D',
  darkBgElevated2: '#1A2129',
  darkBorder: 'rgba(255,255,255,0.08)',
  darkBorderStrong: 'rgba(255,255,255,0.16)',
  darkTextPrimary: '#F2F5F7',
  darkTextSecondary: '#93A0AC',
  darkTextTertiary: '#57626D',
  darkNavBg: 'rgba(18,23,29,0.92)',

  lightBg: '#F5F7F8',
  lightBgElevated: '#FFFFFF',
  lightBgElevated2: '#EEF1F3',
  lightBorder: 'rgba(10,20,28,0.08)',
  lightBorderStrong: 'rgba(10,20,28,0.14)',
  lightTextPrimary: '#0E1418',
  lightTextSecondary: '#5B6670',
  lightTextTertiary: '#8B96A0',
  lightNavBg: 'rgba(255,255,255,0.92)',
} as const;

/** Semantic/brand colors — identical across both themes. */
export const semantic = {
  brand: '#22D6B5', // secure / online / primary CTA / active nav
  brandOnLight: '#0C8E77',
  brandTint: 'rgba(34,214,181,0.16)',
  brandTintLight: 'rgba(12,142,119,0.10)',

  live: '#FF5A5F', // live / recording / critical error
  liveOnLight: '#C4262B',
  liveTint: 'rgba(255,90,95,0.16)',
  liveTintLight: 'rgba(196,38,43,0.10)',

  warning: '#FFB020', // motion / person detected / caution
  warningOnLight: '#966200',
  warningTint: 'rgba(255,176,32,0.16)',
  warningTintLight: 'rgba(150,98,0,0.10)',

  info: '#4C8DFF', // vehicle detected / informational
  infoOnLight: '#2258C7',
  infoTint: 'rgba(76,141,255,0.16)',
  infoTintLight: 'rgba(34,88,199,0.10)',
} as const;

export type ThemeColors = {
  mode: 'dark' | 'light';
  bg: string;
  bgElevated: string;
  bgElevated2: string;
  border: string;
  borderStrong: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  navBg: string;
  brand: string;
  brandTint: string;
  live: string;
  liveTint: string;
  warning: string;
  warningTint: string;
  info: string;
  infoTint: string;
};

export function buildThemeColors(mode: 'dark' | 'light'): ThemeColors {
  const isDark = mode === 'dark';
  return {
    mode,
    bg: isDark ? palette.darkBg : palette.lightBg,
    bgElevated: isDark ? palette.darkBgElevated : palette.lightBgElevated,
    bgElevated2: isDark ? palette.darkBgElevated2 : palette.lightBgElevated2,
    border: isDark ? palette.darkBorder : palette.lightBorder,
    borderStrong: isDark ? palette.darkBorderStrong : palette.lightBorderStrong,
    textPrimary: isDark ? palette.darkTextPrimary : palette.lightTextPrimary,
    textSecondary: isDark ? palette.darkTextSecondary : palette.lightTextSecondary,
    textTertiary: isDark ? palette.darkTextTertiary : palette.lightTextTertiary,
    navBg: isDark ? palette.darkNavBg : palette.lightNavBg,
    brand: isDark ? semantic.brand : semantic.brandOnLight,
    brandTint: isDark ? semantic.brandTint : semantic.brandTintLight,
    live: isDark ? semantic.live : semantic.liveOnLight,
    liveTint: isDark ? semantic.liveTint : semantic.liveTintLight,
    warning: isDark ? semantic.warning : semantic.warningOnLight,
    warningTint: isDark ? semantic.warningTint : semantic.warningTintLight,
    info: isDark ? semantic.info : semantic.infoOnLight,
    infoTint: isDark ? semantic.infoTint : semantic.infoTintLight,
  };
}
