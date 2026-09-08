import React from 'react';
import { View } from 'react-native';
import { Chip } from 'heroui-native';

export type StatusVariant = 'online' | 'offline' | 'recording' | 'motion' | 'live' | 'info';

export type StatusBadgeProps = {
  label: string;
  variant: StatusVariant;
  pulsing?: boolean;
};

type ChipColor = 'success' | 'default' | 'danger' | 'warning';

const CHIP_COLOR: Partial<Record<StatusVariant, ChipColor>> = {
  online: 'success',
  offline: 'default',
  recording: 'danger',
  motion: 'warning',
};

// Tailwind/Uniwind extract class names via a static text scan of the source,
// not by evaluating JS at runtime — a `` `bg-${color}` `` template literal
// never appears as a literal string anywhere in this file, so the bundler
// can't see it and silently generates no style for it. Keeping every
// possible class name spelled out literally here (even though only one is
// picked at runtime) is what makes the lookup safe.
const DOT_CLASS: Record<ChipColor, string> = {
  success: 'bg-success',
  default: 'bg-muted',
  danger: 'bg-danger',
  warning: 'bg-warning',
};

export function StatusBadge({ label, variant, pulsing }: StatusBadgeProps) {
  if (variant === 'live') {
    return (
      <Chip variant="soft" background={null} className="bg-black/55">
        <View className={`size-1.5 rounded-full bg-danger ${pulsing ? 'opacity-90' : ''}`} />
        <Chip.Label className="text-white">{label}</Chip.Label>
      </Chip>
    );
  }

  if (variant === 'info') {
    return (
      <Chip variant="soft" background={null} className="bg-info/15">
        <View className="size-1.5 rounded-full bg-info" />
        <Chip.Label className="text-info">{label}</Chip.Label>
      </Chip>
    );
  }

  const color = CHIP_COLOR[variant] ?? 'default';

  return (
    <Chip variant="soft" color={color}>
      <View className={`size-1.5 rounded-full ${DOT_CLASS[color]} ${pulsing ? 'opacity-90' : ''}`} />
      <Chip.Label>{label}</Chip.Label>
    </Chip>
  );
}
