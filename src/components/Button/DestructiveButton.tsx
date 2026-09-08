import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/theme';

export type DestructiveButtonProps = {
  label: string;
  onPress?: () => void;
};

export function DestructiveButton({ label, onPress }: DestructiveButtonProps) {
  const { colors, radii, fontFamily } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: colors.liveTint,
          borderColor: colors.live,
          borderRadius: radii.md,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
      accessibilityRole="button"
    >
      <Text style={[styles.label, { fontFamily: fontFamily.bodyBold, color: colors.live }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  label: { fontSize: 14 },
});
