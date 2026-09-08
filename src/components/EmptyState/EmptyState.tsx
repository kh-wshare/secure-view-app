import React from 'react';
import { View } from 'react-native';
import { Text as HeroText } from 'heroui-native';
import { useTheme } from '@/theme';
import { Icon, IconName } from '@/components/Icon';
import { PrimaryButton } from '@/components/Button';

export type EmptyStateProps = {
  icon: IconName;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  const { colors } = useTheme();
  return (
    <View className="items-center gap-3.5 px-8 py-12">
      <View className="size-14 items-center justify-center rounded-full bg-default">
        <Icon name={icon} size={24} color={colors.textTertiary} />
      </View>
      <HeroText type="h6" align="center">
        {title}
      </HeroText>
      <HeroText type="body-sm" color="muted" align="center">
        {message}
      </HeroText>
      {actionLabel && onAction && (
        <View className="mt-1.5 self-stretch">
          <PrimaryButton label={actionLabel} onPress={onAction} />
        </View>
      )}
    </View>
  );
}
