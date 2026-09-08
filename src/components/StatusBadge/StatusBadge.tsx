import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme';

export type StatusVariant = 'online' | 'offline' | 'recording' | 'motion' | 'live' | 'info';

export type StatusBadgeProps = {
  label: string;
  variant: StatusVariant;
  pulsing?: boolean;
};

/** Small pill status indicator used across camera cards, live view, and events. */
export function StatusBadge({ label, variant, pulsing }: StatusBadgeProps) {
  const { colors } = useTheme();

  const byVariant: Record<StatusVariant, { dot: string; text: string; bg: string }> = {
    online: { dot: colors.brand, text: colors.brand, bg: colors.brandTint },
    offline: { dot: colors.textTertiary, text: colors.textSecondary, bg: colors.bgElevated2 },
    recording: { dot: colors.live, text: colors.live, bg: colors.liveTint },
    live: { dot: colors.live, text: colors.textPrimary, bg: 'rgba(6,9,12,0.55)' },
    motion: { dot: colors.warning, text: colors.warning, bg: colors.warningTint },
    info: { dot: colors.info, text: colors.info, bg: colors.infoTint },
  };
  const c = byVariant[variant];

  return (
    <View style={[styles.wrap, { backgroundColor: c.bg }]}>
      <View style={[styles.dot, { backgroundColor: c.dot, opacity: pulsing ? 0.9 : 1 }]} />
      <Text style={[styles.label, { color: c.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  dot: { width: 6, height: 6, borderRadius: 999 },
  label: { fontFamily: 'IBMPlexMono_500Medium', fontSize: 10, letterSpacing: 0.4 },
});
