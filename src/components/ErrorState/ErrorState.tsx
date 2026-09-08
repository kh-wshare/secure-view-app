import React from 'react';
import { View } from 'react-native';
import { Button, Text as HeroText } from 'heroui-native';
import { useTheme } from '@/theme';
import { Icon, IconName } from '@/components/Icon';

export type ErrorStateAction = { label: string; onPress: () => void; primary?: boolean };

export type ErrorStateProps = {
  icon: IconName;
  title: string;
  message: string;
  actions?: ErrorStateAction[];
};

/** Reusable error state: camera offline, connection lost, unable to load video, etc. */
export function ErrorState({ icon, title, message, actions = [] }: ErrorStateProps) {
  const { colors } = useTheme();
  return (
    <View className="items-center gap-3 rounded-xl border border-danger/25 bg-surface p-6">
      <View className="size-12 items-center justify-center rounded-full bg-danger/15">
        <Icon name={icon} size={21} color={colors.live} />
      </View>
      <HeroText type="h6" align="center">
        {title}
      </HeroText>
      <HeroText type="body-sm" color="muted" align="center">
        {message}
      </HeroText>
      {actions.length > 0 && (
        <View className="mt-1 flex-row gap-2">
          {actions.map((a) => (
            <Button key={a.label} variant={a.primary ? 'primary' : 'secondary'} size="sm" onPress={a.onPress}>
              <Button.Label>{a.label}</Button.Label>
            </Button>
          ))}
        </View>
      )}
    </View>
  );
}
