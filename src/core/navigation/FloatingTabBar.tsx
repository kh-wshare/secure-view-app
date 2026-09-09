import React, { useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/theme';
import { Icon, IconName } from '@/components/Icon';
import { useAuth } from '@/core/auth/AuthContext';
import { useNotificationStore } from '@/store/useNotificationStore';
import { getInitials } from '@/utils/format';

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

type Layout = { x: number; width: number };

const INDICATOR_WIDTH = 42;
const INDICATOR_HEIGHT = 30;
const SPRING_CONFIG = { stiffness: 260, damping: 26, mass: 0.9 };

/**
 * Floating "liquid glass" bottom nav: strong native blur (BlurView) tinted
 * per theme, a soft gradient highlight along the top edge to catch light
 * like a glass surface, an animated pill that slides beneath the active
 * tab, and an unread badge on Notifications. Custom-built rather than the
 * default tab bar so it can float above content with rounded corners +
 * blur, per the Figma design (see ARCHITECTURE.md).
 */
export function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const { colors, radii, spacing, mode } = useTheme();
  const insets = useSafeAreaInsets();
  const unreadCount = useNotificationStore((s) => s.notifications.filter((n) => !n.read).length);

  const [layouts, setLayouts] = useState<Record<number, Layout>>({});
  const indicatorX = useSharedValue(0);
  const indicatorOpacity = useSharedValue(0);

  const activeLayout = layouts[state.index];

  useEffect(() => {
    if (!activeLayout) return;
    indicatorX.value = withSpring(
      activeLayout.x + activeLayout.width / 2 - INDICATOR_WIDTH / 2,
      SPRING_CONFIG,
    );
    indicatorOpacity.value = withSpring(1, SPRING_CONFIG);
  }, [activeLayout, indicatorX, indicatorOpacity]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    opacity: indicatorOpacity.value,
  }));

  return (
    <View
      style={[styles.wrap, { bottom: insets.bottom + spacing.sm, paddingHorizontal: spacing.md }]}
      pointerEvents="box-none"
    >
      <BlurView
        intensity={mode === 'dark' ? 55 : 72}
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
        {/* Liquid-glass highlight catching light along the top edge */}
        <LinearGradient
          pointerEvents="none"
          colors={
            mode === 'dark'
              ? ['rgba(255,255,255,0.16)', 'rgba(255,255,255,0)']
              : ['rgba(255,255,255,0.85)', 'rgba(255,255,255,0)']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.topHighlight}
        />

        {/* Animated glowing pill behind the active tab */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.indicator,
            {
              backgroundColor: colors.brandTint,
              borderRadius: radii.full,
              shadowColor: colors.brand,
            },
            indicatorStyle,
          ]}
        />

        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const icon = TAB_ICON[route.name] ?? 'home';
          const label = TAB_LABEL[route.name] ?? route.name;
          const badge = route.name === 'NotificationsTab' ? unreadCount : 0;

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
            <TabButton
              key={route.key}
              focused={focused}
              icon={icon}
              label={label}
              badge={badge}
              isProfile={route.name === 'ProfileTab'}
              onPress={onPress}
              onLayout={(event) => {
                const { x, width } = event.nativeEvent.layout;
                setLayouts((prev) => ({ ...prev, [index]: { x, width } }));
              }}
            />
          );
        })}
      </BlurView>
    </View>
  );
}

function TabButton({
  focused,
  icon,
  label,
  badge,
  isProfile,
  onPress,
  onLayout,
}: {
  focused: boolean;
  icon: IconName;
  label: string;
  badge: number;
  isProfile: boolean;
  onPress: () => void;
  onLayout: (event: LayoutChangeEvent) => void;
}) {
  const { colors, radii, fontFamily } = useTheme();
  const { user } = useAuth();
  const scale = useSharedValue(1);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onLayout={onLayout}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.88, { stiffness: 400, damping: 20 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { stiffness: 300, damping: 18 });
      }}
      style={styles.tab}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
    >
      <Animated.View style={[styles.iconWrap, pressStyle]}>
        {isProfile ? (
          <View
            style={[
              styles.avatar,
              {
                borderRadius: radii.full,
                backgroundColor: focused ? colors.brandTint : colors.bgElevated2,
                borderColor: focused ? colors.brand : 'transparent',
              },
            ]}
          >
            <Text
              style={[
                styles.avatarInitials,
                {
                  fontFamily: fontFamily.bodySemibold,
                  color: focused ? colors.brand : colors.textSecondary,
                },
              ]}
            >
              {getInitials(user?.name)}
            </Text>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: colors.brand, borderColor: colors.navBg },
              ]}
            />
          </View>
        ) : (
          <Icon
            name={icon}
            size={20}
            color={focused ? colors.brand : colors.textTertiary}
            filled={focused}
          />
        )}

        {badge > 0 && (
          <View style={[styles.badge, { backgroundColor: colors.live, borderColor: colors.navBg }]}>
            <Text style={styles.badgeLabel} numberOfLines={1}>
              {badge > 9 ? '9+' : String(badge)}
            </Text>
          </View>
        )}
      </Animated.View>

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
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0 },
  bar: {
    flexDirection: 'row',
    borderWidth: 1,
    overflow: 'hidden',
    paddingVertical: 8,
  },
  topHighlight: { position: 'absolute', top: 0, left: 0, right: 0, height: 12 },
  indicator: {
    position: 'absolute',
    top: 6,
    width: INDICATOR_WIDTH,
    height: INDICATOR_HEIGHT,
    shadowOpacity: 0.45,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, paddingVertical: 2 },
  iconWrap: {
    width: 34,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: { fontSize: 8.5 },
  statusDot: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: 8,
    height: 8,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -2,
    minWidth: 15,
    height: 15,
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  badgeLabel: { fontSize: 8.5, fontWeight: '700', color: '#FFFFFF' },
  label: { fontSize: 9.5 },
});
