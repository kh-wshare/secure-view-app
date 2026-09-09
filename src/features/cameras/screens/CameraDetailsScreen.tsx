import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { ListGroup, Separator, Spinner, Tabs } from 'heroui-native';
import { useTheme } from '@/theme';
import { Icon } from '@/components/Icon';
import { StatusBadge, ScreenHeader, ToggleSwitch, ConfirmationDialog } from '@/components';
import { useCameraStore } from '@/store/useCameraStore';
import { useEventStore } from '@/store/useEventStore';
import { EVENT_TYPE_ICON, EVENT_TYPE_LABEL, severityColor } from '@/utils/eventMeta';
import { formatRelativeMinutes } from '@/utils/format';
import type { CamerasStackParamList } from '@/core/navigation/types';

type Nav = NativeStackNavigationProp<CamerasStackParamList, 'CameraDetails'>;
type Rt = RouteProp<CamerasStackParamList, 'CameraDetails'>;

type Tab = 'overview' | 'events' | 'recordings' | 'settings';

export function CameraDetailsScreen() {
  const { colors, spacing, radii, fontFamily } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const cameraId = route.params.cameraId;
  const camera = useCameraStore((s) => s.getById(cameraId));
  const fetchCamera = useCameraStore((s) => s.fetchCamera);
  const deleteCamera = useCameraStore((s) => s.deleteCamera);
  const connectCamera = useCameraStore((s) => s.connectCamera);
  const updateCamera = useCameraStore((s) => s.updateCamera);
  // Select the raw array (a stable reference the store only replaces on an
  // actual update) and filter it here instead of inside the selector — a
  // selector that returns a freshly-allocated array on every call (like
  // `.filter()` would) breaks React's useSyncExternalStore consistency
  // check and causes an infinite render loop.
  const allEvents = useEventStore((s) => s.events);
  const events = useMemo(
    () => allEvents.filter((e) => e.cameraId === cameraId),
    [allEvents, cameraId],
  );
  const fetchCameraEvents = useEventStore((s) => s.fetchCameraEvents);
  const [tab, setTab] = useState<Tab>('overview');
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [removing, setRemoving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchCamera(cameraId);
      fetchCameraEvents(cameraId, { limit: 20 });
    }, [cameraId, fetchCamera, fetchCameraEvents]),
  );

  const handleReconnect = async () => {
    setReconnecting(true);
    try {
      await connectCamera(cameraId);
    } catch {
      // Best-effort — the camera simply stays offline; the user can retry.
    } finally {
      setReconnecting(false);
    }
  };

  const handleRemove = async () => {
    setConfirmRemove(false);
    setRemoving(true);
    try {
      await deleteCamera(cameraId);
      navigation.goBack();
    } catch {
      setRemoving(false);
    }
  };

  const handleToggleEnabled = async (enabled: boolean) => {
    try {
      await updateCamera(cameraId, { enabled });
    } catch {
      // Best-effort — updateCamera leaves the store untouched on failure, so
      // the controlled ToggleSwitch's `value` naturally snaps back to the
      // camera's actual state on the next render.
    }
  };

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

        <Tabs value={tab} onValueChange={(value) => setTab(value as Tab)} variant="primary">
          <Tabs.List>
            <Tabs.Indicator />
            {tabs.map((t) => (
              <Tabs.Trigger key={t.key} value={t.key}>
                <Tabs.Label className="text-sm">{t.label}</Tabs.Label>
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </Tabs>

        {tab === 'overview' && (
          <View style={{ gap: spacing.sm }}>
            <ListGroup>
              <OverviewRow label="Status" value={titleCase(camera.rawStatus)} />
              <Separator className="mx-4" />
              <OverviewRow label="Recording" value={camera.recording ? 'Active' : 'Off'} />
              <Separator className="mx-4" />
              <OverviewRow label="Last motion" value={camera.lastMotionText} />
              <Separator className="mx-4" />
              <OverviewRow
                label="PTZ control"
                value={camera.supportsPtz ? 'Supported' : 'Not available'}
              />
            </ListGroup>
            {camera.status === 'offline' && (
              <ListGroup>
                <ListGroup.Item onPress={handleReconnect} disabled={reconnecting}>
                  <ListGroup.ItemPrefix>
                    {reconnecting ? (
                      <Spinner size="sm" color={colors.brand} />
                    ) : (
                      <Icon name="restart" size={18} color={colors.brand} />
                    )}
                  </ListGroup.ItemPrefix>
                  <ListGroup.ItemContent>
                    <ListGroup.ItemTitle style={{ color: colors.brand }}>
                      {reconnecting ? 'Reconnecting…' : 'Reconnect camera'}
                    </ListGroup.ItemTitle>
                  </ListGroup.ItemContent>
                </ListGroup.Item>
              </ListGroup>
            )}
          </View>
        )}

        {tab === 'events' && (
          <View style={{ gap: spacing.xs }}>
            {events.length === 0 ? (
              <Text
                style={{
                  fontFamily: fontFamily.bodyRegular,
                  color: colors.textSecondary,
                  fontSize: 12.5,
                }}
              >
                No events recorded for this camera yet.
              </Text>
            ) : (
              <ListGroup>
                {events.map((event, index) => {
                  const { fg, tint } = severityColor(colors, event.severity);
                  return (
                    <React.Fragment key={event.id}>
                      {index > 0 && <Separator className="mx-4" />}
                      <ListGroup.Item disabled>
                        <ListGroup.ItemPrefix>
                          <View style={[styles.eventIconWrap, { backgroundColor: tint }]}>
                            <Icon name={EVENT_TYPE_ICON[event.type]} size={16} color={fg} />
                          </View>
                        </ListGroup.ItemPrefix>
                        <ListGroup.ItemContent>
                          <ListGroup.ItemTitle>{EVENT_TYPE_LABEL[event.type]}</ListGroup.ItemTitle>
                          <ListGroup.ItemDescription>
                            {formatRelativeMinutes(event.occurredAt)}
                          </ListGroup.ItemDescription>
                        </ListGroup.ItemContent>
                      </ListGroup.Item>
                    </React.Fragment>
                  );
                })}
              </ListGroup>
            )}
          </View>
        )}

        {tab === 'recordings' && (
          <ListGroup>
            <ListGroup.Item
              onPress={() => navigation.navigate('Recordings', { cameraId: camera.id })}
            >
              <ListGroup.ItemPrefix>
                <Icon name="film" size={18} color={colors.textPrimary} />
              </ListGroup.ItemPrefix>
              <ListGroup.ItemContent>
                <ListGroup.ItemTitle>View all recordings</ListGroup.ItemTitle>
              </ListGroup.ItemContent>
              <ListGroup.ItemSuffix />
            </ListGroup.Item>
          </ListGroup>
        )}

        {tab === 'settings' && (
          <View style={{ gap: spacing.sm }}>
            <ListGroup>
              <ListGroup.Item disabled>
                <ListGroup.ItemContent>
                  <ListGroup.ItemTitle>Camera enabled</ListGroup.ItemTitle>
                </ListGroup.ItemContent>
                <ListGroup.ItemSuffix>
                  <ToggleSwitch
                    value={camera.rawStatus !== 'DISABLED'}
                    onValueChange={handleToggleEnabled}
                  />
                </ListGroup.ItemSuffix>
              </ListGroup.Item>
              <Separator className="mx-4" />
              <ListGroup.Item onPress={() => setConfirmRemove(true)} disabled={removing}>
                <ListGroup.ItemPrefix>
                  {removing ? (
                    <Spinner size="sm" color={colors.live} />
                  ) : (
                    <Icon name="trash" size={17} color={colors.live} />
                  )}
                </ListGroup.ItemPrefix>
                <ListGroup.ItemContent>
                  <ListGroup.ItemTitle style={{ color: colors.live }}>
                    {removing ? 'Removing…' : 'Remove camera'}
                  </ListGroup.ItemTitle>
                </ListGroup.ItemContent>
              </ListGroup.Item>
            </ListGroup>
          </View>
        )}
      </ScrollView>

      <ConfirmationDialog
        visible={confirmRemove}
        title="Remove this camera?"
        message={`${camera.name} will be removed from your account. Recorded footage already saved will not be deleted.`}
        confirmLabel="Remove"
        onCancel={() => setConfirmRemove(false)}
        onConfirm={handleRemove}
      />
    </View>
  );
}

function titleCase(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

function OverviewRow({ label, value }: { label: string; value: string }) {
  const { colors, fontFamily } = useTheme();
  return (
    <ListGroup.Item disabled>
      <ListGroup.ItemContent>
        <ListGroup.ItemTitle>{label}</ListGroup.ItemTitle>
      </ListGroup.ItemContent>
      <ListGroup.ItemSuffix>
        <Text
          style={{ fontFamily: fontFamily.bodySemibold, fontSize: 13, color: colors.textPrimary }}
        >
          {value}
        </Text>
      </ListGroup.ItemSuffix>
    </ListGroup.Item>
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
  eventIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
