import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme';

export type ToggleSwitchProps = {
  value: boolean;
  onValueChange: (next: boolean) => void;
  disabled?: boolean;
};

/** Custom toggle matching the design system exactly (not the OS-default Switch). */
export function ToggleSwitch({ value, onValueChange, disabled }: ToggleSwitchProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => !disabled && onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      hitSlop={8}
      style={[
        styles.track,
        { backgroundColor: value ? colors.brand : colors.bgElevated2, opacity: disabled ? 0.5 : 1 },
      ]}
    >
      <View style={[styles.knob, { left: value ? 23 : 3 }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: { width: 46, height: 26, borderRadius: 999, justifyContent: 'center' },
  knob: {
    position: 'absolute',
    top: 3,
    width: 20,
    height: 20,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },
});
