import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/theme';

export type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export function PrimaryButton({ label, onPress, disabled, loading }: PrimaryButtonProps) {
  const { colors, radii, fontFamily } = useTheme();
  const isInactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isInactive}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: colors.brand,
          borderRadius: radii.md,
          opacity: isInactive ? 0.45 : pressed ? 0.85 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: isInactive }}
    >
      {loading && <ActivityIndicator size="small" color="#06110E" style={styles.spinner} />}
      <Text style={[styles.label, { fontFamily: fontFamily.bodyBold }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  label: { fontSize: 15, color: '#06110E' },
  spinner: { marginRight: 8 },
});
