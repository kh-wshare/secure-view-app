import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme';
import { Icon } from '@/components/Icon';
import { Card, ScreenHeader, PrimaryButton, SecondaryButton } from '@/components';
import { useEventStore } from '@/store/useEventStore';
import { useCameraStore } from '@/store/useCameraStore';
import {
  EVENT_TYPE_ICON,
  EVENT_TYPE_LABEL,
  SEVERITY_LABEL,
  severityColor,
} from '@/utils/eventMeta';
import { formatDuration, formatEventTime } from '@/utils/format';
import type { EventsStackParamList } from '@/core/navigation/types';

type Nav = NativeStackNavigationProp<EventsStackParamList, 'EventDetails'>;
type Rt = RouteProp<EventsStackParamList, 'EventDetails'>;

export function EventDetailsScreen() {
  const { colors, spacing, radii, fontFamily } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const event = useEventStore((s) => s.getById(route.params.eventId));
  const fetchEvent = useEventStore((s) => s.fetchEvent);
  const markReviewed = useEventStore((s) => s.markReviewed);
  const camera = useCameraStore((s) => (event ? s.getById(event.cameraId) : undefined));

  useEffect(() => {
    if (!event) fetchEvent(route.params.eventId);
  }, [event, fetchEvent, route.params.eventId]);

  if (!event) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.bg }]}>
        <ScreenHeader title="Event not found" onBack={() => navigation.goBack()} />
      </View>
    );
  }

  const { fg, tint } = severityColor(colors, event.severity);

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScreenHeader title="Event details" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={{ padding: spacing.md, gap: spacing.lg, paddingBottom: 60 }}
      >
        {camera && (
          <LinearGradient
            colors={camera.thumbnailGradient}
            style={[styles.thumb, { borderRadius: radii.lg }]}
          >
            <View style={[styles.severityChip, { backgroundColor: tint }]}>
              <Text style={[styles.severityLabel, { color: fg }]}>
                {SEVERITY_LABEL[event.severity]}
              </Text>
            </View>
            <View style={[styles.playCircle, { backgroundColor: 'rgba(6,9,12,0.55)' }]}>
              <Icon name="play" size={20} color="#fff" filled />
            </View>
          </LinearGradient>
        )}

        <View style={styles.headingRow}>
          <View style={[styles.iconWrap, { backgroundColor: tint }]}>
            <Icon name={EVENT_TYPE_ICON[event.type]} size={20} color={fg} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.heading,
                { fontFamily: fontFamily.displaySemibold, color: colors.textPrimary },
              ]}
            >
              {EVENT_TYPE_LABEL[event.type]}
            </Text>
            <Text
              style={[
                styles.subheading,
                { fontFamily: fontFamily.bodyRegular, color: colors.textSecondary },
              ]}
            >
              {formatEventTime(event.occurredAt)}
            </Text>
          </View>
        </View>

        <Card style={{ gap: spacing.sm }}>
          <DetailRow label="Camera" value={event.cameraName} />
          <DetailRow label="Severity" value={SEVERITY_LABEL[event.severity]} />
          {event.confidence !== null && (
            <DetailRow label="Confidence" value={`${event.confidence}%`} />
          )}
          {event.durationSeconds !== null && (
            <DetailRow label="Duration" value={formatDuration(event.durationSeconds)} />
          )}
          <DetailRow label="Reviewed" value={event.reviewed ? 'Yes' : 'Not yet'} />
        </Card>

        <View style={{ gap: spacing.sm }}>
          {camera && (
            <PrimaryButton
              label="View live camera"
              onPress={() => navigation.getParent()?.navigate('CamerasTab' as never)}
            />
          )}
          <SecondaryButton
            label={event.reviewed ? 'Mark as unreviewed' : 'Mark as reviewed'}
            onPress={() => markReviewed(event.id, !event.reviewed)}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  const { colors, fontFamily } = useTheme();
  return (
    <View style={styles.detailRow}>
      <Text
        style={[
          styles.detailLabel,
          { fontFamily: fontFamily.bodyRegular, color: colors.textSecondary },
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.detailValue,
          { fontFamily: fontFamily.bodySemibold, color: colors.textPrimary },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  thumb: { height: 200, padding: 12, justifyContent: 'space-between' },
  severityChip: {
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  severityLabel: { fontSize: 11, fontFamily: 'IBMPlexMono_500Medium', letterSpacing: 0.4 },
  playCircle: {
    alignSelf: 'center',
    width: 52,
    height: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: { fontSize: 17 },
  subheading: { fontSize: 12.5, marginTop: 2 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { fontSize: 12.5 },
  detailValue: { fontSize: 12.5 },
});
