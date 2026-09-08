/**
 * Type system: Space Grotesk (display/headings), Manrope (body/UI, default),
 * IBM Plex Mono (timestamps, IDs, durations, technical readouts).
 * Font files are loaded via @expo-google-fonts/* in App.tsx — these keys
 * must match the family names registered there.
 */

export const fontFamily = {
  displayRegular: 'SpaceGrotesk_500Medium',
  displaySemibold: 'SpaceGrotesk_600SemiBold',
  displayBold: 'SpaceGrotesk_700Bold',
  bodyRegular: 'Manrope_400Regular',
  bodyMedium: 'Manrope_500Medium',
  bodySemibold: 'Manrope_600SemiBold',
  bodyBold: 'Manrope_700Bold',
  mono: 'IBMPlexMono_400Regular',
  monoMedium: 'IBMPlexMono_500Medium',
} as const;

export const fontSize = {
  xs: 11,
  sm: 12.5,
  base: 14,
  md: 15,
  lg: 17,
  xl: 19,
  '2xl': 22,
  '3xl': 26,
} as const;

export const textStyles = {
  screenTitle: { fontFamily: fontFamily.displayBold, fontSize: fontSize['3xl'] },
  sectionTitle: { fontFamily: fontFamily.displaySemibold, fontSize: fontSize.lg },
  cardTitle: { fontFamily: fontFamily.bodySemibold, fontSize: fontSize.md },
  body: { fontFamily: fontFamily.bodyRegular, fontSize: fontSize.base },
  bodyMedium: { fontFamily: fontFamily.bodyMedium, fontSize: fontSize.base },
  caption: { fontFamily: fontFamily.bodyRegular, fontSize: fontSize.sm },
  mono: { fontFamily: fontFamily.mono, fontSize: fontSize.xs },
  monoMedium: { fontFamily: fontFamily.monoMedium, fontSize: fontSize.xs },
  navLabel: { fontFamily: fontFamily.bodySemibold, fontSize: 9.5 },
} as const;
