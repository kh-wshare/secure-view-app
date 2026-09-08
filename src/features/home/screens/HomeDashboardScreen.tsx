import React from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme';
import { Icon } from '@/components/Icon';
import { Card, StatusBadge } from '@/components';
import { useCameraStore } from '@/store/useCameraStore';
import { useEventStore } from '@/store/useEventStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { EVENT_TYPE_ICON, EVENT_TYPE_LABEL, severityColor } from '@/utils/eventMeta';
import { formatRelativeMinutes } from '@/utils/format';
import type { HomeStackParamList } from '@/core/navigation/types';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'HomeDashboard'>;

export function HomeDashboardScreen() {
  const { colors, spacing, radii, fontFamily, fontSize } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();

  const cameras = useCameraStore((s) => s.cameras);
  const events = useEventStore((s) => s.events);
  const unreadCount = useNotificationStore((s) => s.notifications.filter((n) => !n.read).length);

  const onlineCount = cameras.filter((c) => c.status === 'online').length;
  const offlineCount = cameras.length - onlineCount;
  const recordingCount = cameras.filter((c) => c.recording).length;
  const allSecure = offlineCount === 0;
  const favorites = cameras.filter((c) => c.favorited);
  const recentEvents = events.slice(0, 4);

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + spacing.sm, paddingBottom: 140 }}
      >
        <View style={{ paddingHorizontal: spacing.md, gap: spacing.lg }}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text
                style={[
                  styles.eyebrow,
                  { fontFamily: fontFamily.bodyMedium, color: colors.textSecondary },
                ]}
              >
                Good evening
              </Text>
              <Text
                style={[
                  styles.title,
                  {
                    fontFamily: fontFamily.displayBold,
                    color: colors.textPrimary,
                    fontSize: fontSize['3xl'],
                  },
                ]}
              >
                SecureView
              </Text>
            </View>
            <Pressable
              onPress={() => navigation.getParent()?.navigate('NotificationsTab' as never)}
              style={[styles.bellButton, { backgroundColor: colors.bgElevated2 }]}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
            >
              <Icon name="bell" size={19} color={colors.textPrimary} />
              {unreadCount > 0 && (
                <View
                  style={[
                    styles.badgeDot,
                    { backgroundColor: colors.live, borderColor: colors.bg },
                  ]}
                />
              )}
            </Pressable>
          </View>

          {/* System status card */}
          <Card style={{ gap: spacing.md }}>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusIconWrap,
                  { backgroundColor: allSecure ? colors.brandTint : colors.warningTint },
                ]}
              >
                <Icon
                  name="shieldCheck"
                  size={22}
                  color={allSecure ? colors.brand : colors.warning}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.statusTitle,
                    { fontFamily: fontFamily.displaySemibold, color: colors.textPrimary },
                  ]}
                >
                  {allSecure ? 'All systems secure' : 'Attention needed'}
                </Text>
                <Text
                  style={[
                    styles.statusSubtitle,
                    { fontFamily: fontFamily.bodyRegular, color: colors.textSecondary },
                  ]}
                >
                  {onlineCount} of {cameras.length} cameras online
                </Text>
              </View>
            </View>

            <View style={[styles.statsRow, { borderTopColor: colors.border }]}>
              <StatItem label="Online" value={String(onlineCount)} color={colors.brand} />
              <StatItem
                label="Offline"
                value={String(offlineCount)}
                color={offlineCount > 0 ? colors.live : colors.textTertiary}
              />
              <StatItem label="Recording" value={String(recordingCount)} color={colors.info} />
            </View>
          </Card>

          {/* Favorite cameras */}
          {favorites.length > 0 && (
            <View style={{ gap: spacing.sm }}>
              <SectionHeading title="Favorite cameras" />
              <FlatList
                horizontal
                data={favorites}
                keyExtractor={(c) => c.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: spacing.sm }}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => navigation.navigate('LiveView', { cameraId: item.id })}
                    style={{ width: 168 }}
                  >
                    <LinearGradient
                      colors={item.thumbnailGradient}
                      style={[styles.favThumb, { borderRadius: radii.lg }]}
                    >
                      <View style={styles.favBadge}>
                        <StatusBadge
                          variant={
                            item.status === 'online'
                              ? item.recording
                                ? 'recording'
                                : 'online'
                              : 'offline'
                          }
                          label={
                            item.status === 'online'
                              ? item.recording
                                ? 'REC'
                                : 'Online'
                              : 'Offline'
                          }
                          pulsing={item.recording}
                        />
                      </View>
                    </LinearGradient>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.favName,
                        { fontFamily: fontFamily.bodySemibold, color: colors.textPrimary },
                      ]}
                    >
                      {item.name}
                    </Text>
                  </Pressable>
                )}
              />
            </View>
          )}

          {/* Recent activity */}
          <View style={{ gap: spacing.sm }}>
            <SectionHeading title="Recent activity" />
            <View style={{ gap: spacing.xs }}>
              {recentEvents.map((event) => {
                const { fg, tint } = severityColor(colors, event.severity);
                return (
                  <Pressable
                    key={event.id}
                    onPress={() => navigation.getParent()?.navigate('EventsTab' as never)}
                  >
                    <Card style={styles.eventRow}>
                      <View style={[styles.eventIconWrap, { backgroundColor: tint }]}>
                        <Icon name={EVENT_TYPE_ICON[event.type]} size={17} color={fg} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.eventTitle,
                            { fontFamily: fontFamily.bodySemibold, color: colors.textPrimary },
                          ]}
                        >
                          {EVENT_TYPE_LABEL[event.type]}
                        </Text>
                        <Text
                          style={[
                            styles.eventMeta,
                            { fontFamily: fontFamily.bodyRegular, color: colors.textSecondary },
                          ]}
                        >
                          {event.cameraName} · {formatRelativeMinutes(event.occurredAt)}
                        </Text>
                      </View>
                      <Icon name="chevronRight" size={16} color={colors.textTertiary} />
                    </Card>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function StatItem({ label, value, color }: { label: string; value: string; color: string }) {
  const { fontFamily, spacing } = useTheme();
  return (
    <View style={[styles.statItem, { paddingTop: spacing.sm }]}>
      <Text style={[styles.statValue, { fontFamily: fontFamily.displaySemibold, color }]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { fontFamily: fontFamily.bodyRegular, color: '#8A97A2' }]}>
        {label}
      </Text>
    </View>
  );
}

function SectionHeading({ title }: { title: string }) {
  const { colors, fontFamily } = useTheme();
  return (
    <Text
      style={[
        styles.sectionTitle,
        { fontFamily: fontFamily.displaySemibold, color: colors.textPrimary },
      ]}
    >
      {title}
    </Text>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  eyebrow: { fontSize: 13 },
  title: { marginTop: 2 },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDot: {
    position: 'absolute',
    top: 6,
    right: 7,
    width: 9,
    height: 9,
    borderRadius: 999,
    borderWidth: 2,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTitle: { fontSize: 15.5 },
  statusSubtitle: { fontSize: 12.5, marginTop: 2 },
  statsRow: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontSize: 20 },
  statLabel: { fontSize: 11 },
  favThumb: { height: 96, overflow: 'hidden', justifyContent: 'flex-end', padding: 8 },
  favBadge: { alignSelf: 'flex-start' },
  favName: { fontSize: 12.5, marginTop: 6 },
  sectionTitle: { fontSize: 15.5 },
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  eventIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventTitle: { fontSize: 13.5 },
  eventMeta: { fontSize: 11.5, marginTop: 1 },
});
