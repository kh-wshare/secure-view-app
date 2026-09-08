import React from 'react';
import { Switch } from 'heroui-native';

export type ToggleSwitchProps = {
  value: boolean;
  onValueChange: (next: boolean) => void;
  disabled?: boolean;
};

export function ToggleSwitch({ value, onValueChange, disabled }: ToggleSwitchProps) {
  return (
    <Switch isSelected={value} onSelectedChange={onValueChange} isDisabled={disabled}>
      <Switch.Thumb />
    </Switch>
  );
}
