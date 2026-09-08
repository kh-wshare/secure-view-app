import React from 'react';
import { Button } from 'heroui-native';

export type SecondaryButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
};

/** Bordered, neutral-background button for secondary actions ("Back", "Cancel", "Done"). */
export function SecondaryButton({ label, onPress, disabled }: SecondaryButtonProps) {
  return (
    <Button variant="secondary" onPress={onPress} isDisabled={disabled}>
      <Button.Label>{label}</Button.Label>
    </Button>
  );
}
