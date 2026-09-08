import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '@/theme';
import { Icon, IconName } from '@/components/Icon';

const TAB_ICON: Record<string, IconName> = {
  HomeTab: 'home',
  CamerasTab: 'cameras',
  EventsTab: 'events',
  NotificationsTab: 'bell',
  ProfileTab: 'user',
};

const TAB_LABEL: Record<string, string> = {
  HomeTab: 'Home',
  CamerasTab: 'Cameras',
  EventsTab: 'Events',
  NotificationsTab: 'Notifications',
  ProfileTab: 'Profile',
};

/**
 * Floating pill bottom nav matching the design system (radii.nav = 28,
 * translucent blurred background). Custom-built rather than the default
 * tab bar so it can float above content with rounded corners + blur.
 */
export function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const { colors, radii, spacing, fontFamily, mode } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.wrap, { bottom: insets.bottom + spacing.sm, paddingHorizontal: spacing.md }]}
      pointerEvents="box-none"
    >
      <BlurView
        intensity={40}
        tint={mode === 'dark' ? 'dark' : 'light'}
        style={[
          styles.bar,
          {
            borderRadius: radii.nav,
            borderColor: colors.border,
            backgroundColor: colors.navBg,
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const icon = TAB_ICON[route.name] ?? 'home';
          const label = TAB_LABEL[route.name] ?? route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.tab}
              accessibilityRole="button"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={label}
            >
              <View
                style={[
                  styles.iconWrap,
                  focused && { backgroundColor: colors.brandTint, borderRadius: radii.full },
                ]}
              >
                <Icon name={icon} size={19} color={focused ? colors.brand : colors.textTertiary} />
              </View>
              <Text
                numberOfLines={1}
                style={[
                  styles.label,
                  {
                    fontFamily: fontFamily.bodySemibold,
                    color: focused ? colors.brand : colors.textTertiary,
                  },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0 },
  bar: {
    flexDirection: 'row',
    borderWidth: 1,
    overflow: 'hidden',
    paddingVertical: 8,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, paddingVertical: 2 },
  iconWrap: { width: 34, height: 22, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 9.5 },
});
