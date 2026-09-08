import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Text as HeroText } from 'heroui-native';
import { Icon, IconName } from '@/components/Icon';
import { useTheme } from '@/theme';

export type ScreenHeaderAction = {
  icon: IconName;
  onPress: () => void;
  accessibilityLabel: string;
};

export type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  /** Up to two icon actions on the trailing edge (e.g. share + more, or edit). */
  actions?: ScreenHeaderAction[];
  /** Renders the header without a bottom border/background, floating over content (e.g. Live View). */
  transparent?: boolean;
};

/**
 * Shared top header used across detail/stack screens: back button, title
 * (+ optional subtitle), and 0-2 trailing icon actions. Respects the safe
 * area inset so it sits correctly under the notch/status bar.
 */
export function ScreenHeader({
  title,
  subtitle,
  onBack,
  actions = [],
  transparent = false,
}: ScreenHeaderProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      className={`flex-row items-center px-4 pb-2.5 ${
        transparent ? 'bg-transparent' : 'bg-background border-b border-border'
      }`}
      style={{ paddingTop: insets.top + 4 }}
    >
      <View className="min-w-10 flex-row items-center">
        {onBack && (
          <Button
            variant="secondary"
            size="sm"
            isIconOnly
            onPress={onBack}
            accessibilityLabel="Go back"
          >
            <Icon name="arrowLeft" size={18} color={colors.textPrimary} />
          </Button>
        )}
      </View>

      <View className="flex-1 items-center">
        <HeroText type="h6" numberOfLines={1}>
          {title}
        </HeroText>
        {subtitle ? (
          <HeroText type="body-xs" color="muted" numberOfLines={1} className="mt-0.5">
            {subtitle}
          </HeroText>
        ) : null}
      </View>

      <View className="min-w-10 flex-row items-center justify-end">
        {actions.map((a) => (
          <Button
            key={a.accessibilityLabel}
            variant="secondary"
            size="sm"
            isIconOnly
            onPress={a.onPress}
            accessibilityLabel={a.accessibilityLabel}
            className="ml-2"
          >
            <Icon name={a.icon} size={18} color={colors.textPrimary} />
          </Button>
        ))}
      </View>
    </View>
  );
}
