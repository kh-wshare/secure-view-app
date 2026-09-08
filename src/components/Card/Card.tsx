import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { useTheme } from '@/theme';

export function Card({ style, ...rest }: ViewProps) {
  const { colors, radii, spacing } = useTheme();
  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: colors.bgElevated,
          borderColor: colors.border,
          borderRadius: radii.lg,
          padding: spacing.md,
        },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({ base: { borderWidth: 1 } });
