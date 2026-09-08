import React from 'react';
import { Button } from 'heroui-native';

export type DestructiveButtonProps = {
  label: string;
  onPress?: () => void;
};

/**
 * Soft/tinted destructive action button (danger-tinted background + border,
 * danger-colored label) — HeroUI's "danger-soft" variant matches this app's
 * existing destructive-but-not-alarming button style exactly.
 */
export function DestructiveButton({ label, onPress }: DestructiveButtonProps) {
  return (
    <Button variant="danger-soft" onPress={onPress}>
      <Button.Label>{label}</Button.Label>
    </Button>
  );
}
