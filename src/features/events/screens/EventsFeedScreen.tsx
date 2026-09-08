import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@/theme';
import { Icon } from '@/components/Icon';
import { Card, EmptyState } from '@/components';
import { useEventStore } from '@/store/useEventStore';
import { EVENT_TYPE_ICON, EVENT_TYPE_LABEL, severityColor } from '@/utils/eventMeta';
import { formatEventTime, groupByDay } from '@/utils/format';
import type { EventsStackParamList } from '@/app/navigation/types';
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
  const { colors, spacing, radii, fontFamily } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const events = useEventStore((s) => s.events);
  const [filter, setFilter] = useState<FilterType>('all');

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

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={FILTERS}
        keyExtractor={(f) => f.key}
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          gap: spacing.xs,
          paddingVertical: spacing.sm,
        }}
        renderItem={({ item }) => {
          const active = filter === item.key;
          return (
            <Pressable
              onPress={() => setFilter(item.key)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? colors.brandTint : colors.bgElevated2,
                  borderColor: active ? colors.brand : colors.border,
                  borderRadius: radii.full,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipLabel,
                  {
                    fontFamily: fontFamily.bodySemibold,
                    color: active ? colors.brand : colors.textSecondary,
                  },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        }}
      />

      <SectionList
        sections={sections}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ padding: spacing.md, paddingTop: spacing.xs, paddingBottom: 140 }}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <EmptyState
            icon="events"
            title="No events yet"
            message="Events from your cameras will show up here as they happen."
          />
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
  chip: { borderWidth: 1, paddingVertical: 8, paddingHorizontal: 14 },
  chipLabel: { fontSize: 12.5 },
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
