import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
  const { colors, spacing, fontFamily } = useTheme();
  return (
    <View style={[styles.wrap, { paddingVertical: spacing['3xl'] }]}>
      <View style={[styles.iconCircle, { backgroundColor: colors.bgElevated2 }]}>
        <Icon name={icon} size={24} color={colors.textTertiary} />
      </View>
      <Text
        style={[
          styles.title,
          { fontFamily: fontFamily.displaySemibold, color: colors.textPrimary },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.message,
          { fontFamily: fontFamily.bodyRegular, color: colors.textSecondary },
        ]}
      >
        {message}
      </Text>
      {actionLabel && onAction && (
        <View style={styles.action}>
          <PrimaryButton label={actionLabel} onPress={onAction} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingHorizontal: 32, gap: 14 },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 15, textAlign: 'center' },
  message: { fontSize: 12.5, textAlign: 'center', lineHeight: 18 },
  action: { marginTop: 6, alignSelf: 'stretch' },
});
