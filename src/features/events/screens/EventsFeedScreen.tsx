import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, SectionList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TagGroup } from 'heroui-native';
import { useTheme } from '@/theme';
import { Icon } from '@/components/Icon';
import { Card, EmptyState, ErrorState } from '@/components';
import { useEventStore } from '@/store/useEventStore';
import { EVENT_TYPE_ICON, EVENT_TYPE_LABEL, severityColor } from '@/utils/eventMeta';
import { formatEventTime, groupByDay } from '@/utils/format';
import type { EventsStackParamList } from '@/core/navigation/types';
import type { EventType } from '@/types/domain';

type Nav = NativeStackNavigationProp<EventsStackParamList, 'EventsFeed'>;
type FilterType = 'all' | EventType;

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'person', label: 'People' },
  { key: 'vehicle', label: 'Vehicles' },
  { key: 'motion', label: 'Motion' },
];

export function EventsFeedScreen() {
  const { colors, spacing, fontFamily } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const events = useEventStore((s) => s.events);
  const status = useEventStore((s) => s.status);
  const error = useEventStore((s) => s.error);
  const fetchEvents = useEventStore((s) => s.fetchEvents);
  const [filter, setFilter] = useState<FilterType>('all');

  useFocusEffect(
    useCallback(() => {
      fetchEvents({ limit: 100 });
    }, [fetchEvents]),
  );

  const filtered = filter === 'all' ? events : events.filter((e) => e.type === filter);
  const sections = useMemo(
    () => groupByDay(filtered).map((g) => ({ title: g.label, data: g.items })),
    [filtered],
  );

  return (
    <View
      style={[styles.screen, { backgroundColor: colors.bg, paddingTop: insets.top + spacing.sm }]}
    >
      <Text
        style={[
          styles.title,
          {
            fontFamily: fontFamily.displayBold,
            color: colors.textPrimary,
            paddingHorizontal: spacing.md,
          },
        ]}
      >
        Events
      </Text>

      {/* HeroUI Native's TagGroup (https://heroui.com/en/docs/native/components/tag-group) */}
      <TagGroup
        selectionMode="single"
        selectedKeys={new Set([filter])}
        onSelectionChange={(keys) => {
          const next = Array.from(keys)[0];
          if (typeof next === 'string') setFilter(next as FilterType);
        }}
        style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}
      >
        <TagGroup.List>
          {FILTERS.map((f) => (
            <TagGroup.Item key={f.key} id={f.key}>
              {f.label}
            </TagGroup.Item>
          ))}
        </TagGroup.List>
      </TagGroup>

      <SectionList
        sections={sections}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ padding: spacing.md, paddingTop: spacing.xs, paddingBottom: 140 }}
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl
            refreshing={status === 'loading' && events.length > 0}
            onRefresh={() => fetchEvents({ limit: 100 })}
            tintColor={colors.brand}
          />
        }
        ListEmptyComponent={
          status === 'error' ? (
            <ErrorState
              icon="alertTriangle"
              title="Couldn't load events"
              message={error ?? 'Something went wrong.'}
              actions={[
                { label: 'Retry', onPress: () => fetchEvents({ limit: 100 }), primary: true },
              ]}
            />
          ) : (
            <EmptyState
              icon="events"
              title="No events yet"
              message="Events from your cameras will show up here as they happen."
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
        renderItem={({ item }) => {
          const { fg, tint } = severityColor(colors, item.severity);
          return (
            <Pressable onPress={() => navigation.navigate('EventDetails', { eventId: item.id })}>
              <Card style={styles.row}>
                <View style={[styles.iconWrap, { backgroundColor: tint }]}>
                  <Icon name={EVENT_TYPE_ICON[item.type]} size={17} color={fg} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.rowTitle,
                      { fontFamily: fontFamily.bodySemibold, color: colors.textPrimary },
                    ]}
                  >
                    {EVENT_TYPE_LABEL[item.type]}
                  </Text>
                  <Text
                    style={[
                      styles.rowMeta,
                      { fontFamily: fontFamily.bodyRegular, color: colors.textSecondary },
                    ]}
                  >
                    {item.cameraName} · {formatEventTime(item.occurredAt)}
                  </Text>
                </View>
                {!item.reviewed && (
                  <View style={[styles.unreadDot, { backgroundColor: colors.brand }]} />
                )}
                <Icon name="chevronRight" size={16} color={colors.textTertiary} />
              </Card>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  title: { fontSize: 26 },
  sectionHeader: {
    fontSize: 11.5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 6,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: { fontSize: 13.5 },
  rowMeta: { fontSize: 11.5, marginTop: 1 },
  unreadDot: { width: 7, height: 7, borderRadius: 999 },
});
