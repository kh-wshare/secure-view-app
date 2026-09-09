import React, { useCallback, useMemo } from 'react';
import { Pressable, RefreshControl, SectionList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@/theme';
import { Icon } from '@/components/Icon';
import { Card, EmptyState, ErrorState } from '@/components';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useEventStore } from '@/store/useEventStore';
import { EVENT_TYPE_ICON } from '@/utils/eventMeta';
import { formatDayGroup, formatEventTime } from '@/utils/format';
import type { NotificationsStackParamList } from '@/core/navigation/types';
import type { NotificationItem } from '@/types/domain';

type Nav = NativeStackNavigationProp<NotificationsStackParamList, 'NotificationsFeed'>;

export function NotificationsFeedScreen() {
  const { colors, spacing, fontFamily } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const notifications = useNotificationStore((s) => s.notifications);
  const status = useNotificationStore((s) => s.status);
  const error = useNotificationStore((s) => s.error);
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const toggleRead = useNotificationStore((s) => s.toggleRead);
  const remove = useNotificationStore((s) => s.remove);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const events = useEventStore((s) => s.events);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications({ limit: 100 });
    }, [fetchNotifications]),
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  const sections = useMemo(() => {
    const groups: { title: string; data: NotificationItem[] }[] = [];
    for (const item of notifications) {
      const label = formatDayGroup(item.occurredAt);
      const existing = groups.find((g) => g.title === label);
      if (existing) existing.data.push(item);
      else groups.push({ title: label, data: [item] });
    }
    return groups;
  }, [notifications]);

  const eventIdForNotification = (n: NotificationItem) =>
    events.find((e) => e.cameraName && e.type === n.type)?.id;

  return (
    <View
      style={[styles.screen, { backgroundColor: colors.bg, paddingTop: insets.top + spacing.sm }]}
    >
      <View style={[styles.headerRow, { paddingHorizontal: spacing.md }]}>
        <Text
          style={[styles.title, { fontFamily: fontFamily.displayBold, color: colors.textPrimary }]}
        >
          Notifications
        </Text>
        {unreadCount > 0 && (
          <Pressable onPress={markAllRead} hitSlop={8}>
            <Text
              style={[styles.markAll, { fontFamily: fontFamily.bodySemibold, color: colors.brand }]}
            >
              Mark all read
            </Text>
          </Pressable>
        )}
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(n) => n.id}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 140 }}
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl
            refreshing={status === 'loading' && notifications.length > 0}
            onRefresh={() => fetchNotifications({ limit: 100 })}
            tintColor={colors.brand}
          />
        }
        ListEmptyComponent={
          status === 'error' ? (
            <ErrorState
              icon="alertTriangle"
              title="Couldn't load notifications"
              message={error ?? 'Something went wrong.'}
              actions={[
                {
                  label: 'Retry',
                  onPress: () => fetchNotifications({ limit: 100 }),
                  primary: true,
                },
              ]}
            />
          ) : (
            <EmptyState
              icon="bell"
              title="You're all caught up"
              message="New alerts from your cameras will appear here."
            />
          )
        }
        renderSectionHeader={({ section }) => (
          <Text
            style={[
              styles.sectionHeader,
              { fontFamily: fontFamily.bodySemibold, color: colors.textSecondary },
            ]}
          >
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              toggleRead(item.id);
              const eventId = eventIdForNotification(item);
              if (eventId) navigation.navigate('EventDetails', { eventId });
            }}
            onLongPress={() => remove(item.id)}
          >
            <Card style={[styles.row, !item.read && { borderColor: colors.brand }]}>
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: item.read ? colors.bgElevated2 : colors.brandTint },
                ]}
              >
                <Icon
                  name={EVENT_TYPE_ICON[item.type]}
                  size={16}
                  color={item.read ? colors.textSecondary : colors.brand}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  numberOfLines={2}
                  style={[
                    styles.rowTitle,
                    {
                      fontFamily: item.read ? fontFamily.bodyMedium : fontFamily.bodySemibold,
                      color: colors.textPrimary,
                    },
                  ]}
                >
                  {item.title}
                </Text>
                <Text
                  style={[
                    styles.rowMeta,
                    { fontFamily: fontFamily.bodyRegular, color: colors.textSecondary },
                  ]}
                >
                  {formatEventTime(item.occurredAt)}
                </Text>
              </View>
              {!item.read && <View style={[styles.unreadDot, { backgroundColor: colors.brand }]} />}
            </Card>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 26 },
  markAll: { fontSize: 12.5 },
  sectionHeader: {
    fontSize: 11.5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 6,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8, borderWidth: 1 },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: { fontSize: 13 },
  rowMeta: { fontSize: 11, marginTop: 2 },
  unreadDot: { width: 7, height: 7, borderRadius: 999 },
});
