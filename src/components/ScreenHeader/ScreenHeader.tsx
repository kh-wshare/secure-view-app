import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import { Icon, IconName } from '@/components/Icon';

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
  const { colors, spacing, fontFamily } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrap,
        {
          paddingTop: insets.top + spacing.xs,
          paddingHorizontal: spacing.md,
          paddingBottom: spacing.sm,
          backgroundColor: transparent ? 'transparent' : colors.bg,
          borderBottomColor: colors.border,
          borderBottomWidth: transparent ? 0 : StyleSheet.hairlineWidth,
        },
      ]}
    >
      <View style={styles.side}>
        {onBack && (
          <Pressable
            onPress={onBack}
            hitSlop={10}
            style={[styles.iconButton, { backgroundColor: colors.bgElevated2 }]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Icon name="arrowLeft" size={18} color={colors.textPrimary} />
          </Pressable>
        )}
      </View>

      <View style={styles.center}>
        <Text
          numberOfLines={1}
          style={[
            styles.title,
            { fontFamily: fontFamily.displaySemibold, color: colors.textPrimary },
          ]}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            numberOfLines={1}
            style={[
              styles.subtitle,
              { fontFamily: fontFamily.bodyRegular, color: colors.textSecondary },
            ]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={[styles.side, styles.sideEnd]}>
        {actions.map((a) => (
          <Pressable
            key={a.accessibilityLabel}
            onPress={a.onPress}
            hitSlop={10}
            style={[
              styles.iconButton,
              { backgroundColor: colors.bgElevated2, marginLeft: spacing.xs },
            ]}
            accessibilityRole="button"
            accessibilityLabel={a.accessibilityLabel}
          >
            <Icon name={a.icon} size={18} color={colors.textPrimary} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center' },
  side: { minWidth: 40, flexDirection: 'row', alignItems: 'center' },
  sideEnd: { justifyContent: 'flex-end' },
  center: { flex: 1, alignItems: 'center' },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 16 },
  subtitle: { fontSize: 11.5, marginTop: 1 },
});
