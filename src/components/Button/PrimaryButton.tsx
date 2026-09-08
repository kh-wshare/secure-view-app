import React from 'react';
import { ActivityIndicator } from 'react-native';
import { Button } from 'heroui-native';

export type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
};

/**
 * The app's main CTA button — thin wrapper around HeroUI Native's
 * <Button variant="primary">, which reads the `--accent` / `--accent-foreground`
 * tokens from src/global.css (mapped to the brand teal everywhere else in
 * the design system). Kept as its own component (rather than using
 * heroui-native's Button directly in screens) so the `loading` behavior
 * and the app's button API stay stable if we ever swap the underlying
 * implementation again.
 */
export function PrimaryButton({ label, onPress, disabled, loading }: PrimaryButtonProps) {
  const isInactive = disabled || loading;

  return (
    <Button variant="primary" onPress={onPress} isDisabled={isInactive}>
      {loading && <ActivityIndicator size="small" color="#06110E" />}
      <Button.Label>{label}</Button.Label>
    </Button>
  );
}
