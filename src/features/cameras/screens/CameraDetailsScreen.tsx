import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme';
import { Icon } from '@/components/Icon';
import { Card, StatusBadge, ScreenHeader, ToggleSwitch, ConfirmationDialog } from '@/components';
import { useCameraStore } from '@/store/useCameraStore';
import { useEventStore } from '@/store/useEventStore';
import { EVENT_TYPE_ICON, EVENT_TYPE_LABEL, severityColor } from '@/utils/eventMeta';
import { formatRelativeMinutes } from '@/utils/format';
import type { CamerasStackParamList } from '@/app/navigation/types';

type Nav = NativeStackNavigationProp<CamerasStackParamList, 'CameraDetails'>;
type Rt = RouteProp<CamerasStackParamList, 'CameraDetails'>;

type Tab = 'overview' | 'events' | 'recordings' | 'settings';

export function CameraDetailsScreen() {
  const { colors, spacing, radii, fontFamily } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const camera = useCameraStore((s) => s.getById(route.params.cameraId));
  const events = useEventStore((s) => s.events.filter((e) => e.cameraId === route.params.cameraId));
  const [tab, setTab] = useState<Tab>('overview');
  const [confirmRemove, setConfirmRemove] = useState(false);

  if (!camera) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.bg }]}>
        <ScreenHeader title="Camera not found" onBack={() => navigation.goBack()} />
      </View>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'events', label: 'Events' },
    { key: 'recordings', label: 'Recordings' },
    { key: 'settings', label: 'Settings' },
  ];

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScreenHeader
        title={camera.name}
        subtitle={camera.location}
        onBack={() => navigation.goBack()}
        actions={[
          {
            icon: 'share',
            accessibilityLabel: 'Share camera',
            onPress: () => navigation.navigate('CameraSharing', { cameraId: camera.id }),
          },
        ]}
      />

      <ScrollView
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 60, gap: spacing.lg }}
      >
        <Pressable onPress={() => navigation.navigate('LiveView', { cameraId: camera.id })}>
          <LinearGradient
            colors={camera.thumbnailGradient}
            style={[styles.hero, { borderRadius: radii.lg }]}
          >
            <View style={styles.heroTopRow}>
              <StatusBadge
                variant={
                  camera.status === 'offline'
                    ? 'offline'
                    : camera.recording
                      ? 'recording'
                      : 'online'
                }
                label={
                  camera.status === 'offline'
                    ? 'Offline'
                    : camera.recording
                      ? 'Recording'
                      : 'Online'
                }
                pulsing={camera.recording}
              />
              {camera.supportsPtz && (
                <View style={[styles.ptzChip, { backgroundColor: 'rgba(6,9,12,0.55)' }]}>
                  <Text style={styles.ptzChipLabel}>PTZ</Text>
                </View>
              )}
            </View>
            <View style={[styles.playCircle, { backgroundColor: 'rgba(6,9,12,0.55)' }]}>
              <Icon name="play" size={22} color="#FFFFFF" filled />
            </View>
          </LinearGradient>
        </Pressable>

        {/* Segmented tabs */}
        <View
          style={[
            styles.segmentWrap,
            { backgroundColor: colors.bgElevated2, borderRadius: radii.md },
          ]}
        >
          {tabs.map((t) => {
            const active = tab === t.key;
            return (
              <Pressable
                key={t.key}
                onPress={() => setTab(t.key)}
                style={[
                  styles.segment,
                  active && { backgroundColor: colors.bgElevated, borderRadius: radii.sm },
                ]}
              >
                <Text
                  style={[
                    styles.segmentLabel,
                    {
                      fontFamily: fontFamily.bodySemibold,
                      color: active ? colors.textPrimary : colors.textSecondary,
                    },
                  ]}
                >
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {tab === 'overview' && (
          <View style={{ gap: spacing.sm }}>
            <Card style={{ gap: spacing.sm }}>
              <InfoRow label="Status" value={camera.status === 'online' ? 'Online' : 'Offline'} />
              <InfoRow label="Recording" value={camera.recording ? 'Active' : 'Off'} />
              <InfoRow label="Last motion" value={camera.lastMotionText} />
              <InfoRow
                label="PTZ control"
                value={camera.supportsPtz ? 'Supported' : 'Not available'}
              />
            </Card>
          </View>
        )}

        {tab === 'events' && (
          <View style={{ gap: spacing.xs }}>
            {events.length === 0 && (
              <Text
                style={{
                  fontFamily: fontFamily.bodyRegular,
                  color: colors.textSecondary,
                  fontSize: 12.5,
                }}
              >
                No events recorded for this camera yet.
              </Text>
            )}
            {events.map((event) => {
              const { fg, tint } = severityColor(colors, event.severity);
              return (
                <Card key={event.id} style={styles.eventRow}>
                  <View style={[styles.eventIconWrap, { backgroundColor: tint }]}>
                    <Icon name={EVENT_TYPE_ICON[event.type]} size={16} color={fg} />
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
                      {formatRelativeMinutes(event.occurredAt)}
                    </Text>
                  </View>
                </Card>
              );
            })}
          </View>
        )}

        {tab === 'recordings' && (
          <Pressable onPress={() => navigation.navigate('Recordings', { cameraId: camera.id })}>
            <Card style={styles.linkRow}>
              <Icon name="film" size={18} color={colors.textPrimary} />
              <Text
                style={[
                  styles.linkLabel,
                  { fontFamily: fontFamily.bodySemibold, color: colors.textPrimary },
                ]}
              >
                View all recordings
              </Text>
              <Icon name="chevronRight" size={16} color={colors.textTertiary} />
            </Card>
          </Pressable>
        )}

        {tab === 'settings' && (
          <View style={{ gap: spacing.sm }}>
            <Card style={styles.settingRow}>
              <Text
                style={[
                  styles.settingLabel,
                  { fontFamily: fontFamily.bodyMedium, color: colors.textPrimary },
                ]}
              >
                Continuous recording
              </Text>
              <ToggleSwitch value={camera.recording} onValueChange={() => {}} />
            </Card>
            <Card style={styles.settingRow}>
              <Text
                style={[
                  styles.settingLabel,
                  { fontFamily: fontFamily.bodyMedium, color: colors.textPrimary },
                ]}
              >
                Motion alerts
              </Text>
              <ToggleSwitch value={camera.motionRecent} onValueChange={() => {}} />
            </Card>
            <Pressable onPress={() => setConfirmRemove(true)}>
              <Card style={[styles.settingRow, { borderColor: colors.live }]}>
                <Text
                  style={[
                    styles.settingLabel,
                    { fontFamily: fontFamily.bodySemibold, color: colors.live },
                  ]}
                >
                  Remove camera
                </Text>
                <Icon name="trash" size={17} color={colors.live} />
              </Card>
            </Pressable>
          </View>
        )}
      </ScrollView>

      <ConfirmationDialog
        visible={confirmRemove}
        title="Remove this camera?"
        message={`${camera.name} will be removed from your account. Recorded footage already saved will not be deleted.`}
        confirmLabel="Remove"
        onCancel={() => setConfirmRemove(false)}
        onConfirm={() => {
          setConfirmRemove(false);
          navigation.goBack();
        }}
      />
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const { colors, fontFamily } = useTheme();
  return (
    <View style={styles.infoRow}>
      <Text
        style={[
          styles.infoLabel,
          { fontFamily: fontFamily.bodyRegular, color: colors.textSecondary },
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.infoValue,
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
  hero: { height: 200, padding: 12, justifyContent: 'space-between' },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between' },
  ptzChip: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 999 },
  ptzChipLabel: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'IBMPlexMono_500Medium',
    letterSpacing: 0.5,
  },
  playCircle: {
    alignSelf: 'center',
    width: 52,
    height: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentWrap: { flexDirection: 'row', padding: 3 },
  segment: { flex: 1, paddingVertical: 8, alignItems: 'center' },
  segmentLabel: { fontSize: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoLabel: { fontSize: 12.5 },
  infoValue: { fontSize: 12.5 },
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  eventIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventTitle: { fontSize: 13 },
  eventMeta: { fontSize: 11, marginTop: 1 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  linkLabel: { flex: 1, fontSize: 13.5 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  settingLabel: { fontSize: 13.5 },
});
