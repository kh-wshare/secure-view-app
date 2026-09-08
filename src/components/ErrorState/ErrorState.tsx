import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
  const { colors, fontFamily, radii } = useTheme();
  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: colors.bgElevated,
          borderColor: colors.liveTint,
          borderRadius: radii.lg,
        },
      ]}
    >
      <View style={[styles.iconCircle, { backgroundColor: colors.liveTint }]}>
        <Icon name={icon} size={21} color={colors.live} />
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
      {actions.length > 0 && (
        <View style={styles.actions}>
          {actions.map((a) => (
            <Text
              key={a.label}
              onPress={a.onPress}
              style={[
                styles.actionBtn,
                {
                  fontFamily: fontFamily.bodyBold,
                  color: a.primary ? '#06110E' : colors.textPrimary,
                  backgroundColor: a.primary ? colors.brand : colors.bgElevated2,
                },
              ]}
            >
              {a.label}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderWidth: 1, alignItems: 'center', padding: 26, gap: 12 },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 14.5, textAlign: 'center' },
  message: { fontSize: 12, textAlign: 'center', lineHeight: 17 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  actionBtn: {
    fontSize: 12,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 10,
    overflow: 'hidden',
  },
});
