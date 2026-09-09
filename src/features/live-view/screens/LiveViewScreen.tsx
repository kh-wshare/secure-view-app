import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import type { RTCVideoViewProps } from 'react-native-webrtc';
import { useTheme } from '@/theme';
import { Icon, IconName } from '@/components/Icon';
import { StatusBadge } from '@/components';
import { useCameraStore } from '@/store/useCameraStore';
import { useWhepStream } from '../hooks/useWhepStream';
import { isWebrtcAvailable } from '../isWebrtcAvailable';
import type { HomeStackParamList } from '@/core/navigation/types';

type Rt = RouteProp<HomeStackParamList, 'LiveView'>;

/**
 * `react-native-webrtc` throws immediately when imported without its native
 * module present (Expo Go), so `RTCView` — like the peer connection in
 * `useWhepStream` — is loaded lazily via `require()` inside the component
 * instead of a static top-level `import`. A static import here would crash
 * every screen in every stack at boot, since React Navigation eagerly
 * imports every registered screen component regardless of whether it's ever
 * rendered.
 */
function loadRTCView(): React.ComponentType<RTCVideoViewProps> | null {
  if (!isWebrtcAvailable()) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('react-native-webrtc').RTCView;
  } catch {
    return null;
  }
}

/**
 * Full-screen live view. Negotiates a real WHEP session via `useWhepStream`
 * once the camera is online; falls back to a gradient placeholder while
 * connecting, on error, or for an offline camera (nothing to stream yet).
 */
export function LiveViewScreen() {
  const { spacing, radii, fontFamily } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<Rt>();
  const camera = useCameraStore((s) => s.getById(route.params.cameraId));
  const [muted, setMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [recording, setRecording] = useState(camera?.recording ?? false);
  const [RTCViewComponent] = useState(() => loadRTCView());

  const {
    status: streamStatus,
    error: streamError,
    remoteStream,
  } = useWhepStream(route.params.cameraId, camera?.status === 'online');

  useEffect(() => {
    remoteStream?.getAudioTracks().forEach((track) => {
      track.enabled = speakerOn;
    });
  }, [remoteStream, speakerOn]);

  if (!camera) {
    return (
      <View style={styles.notFound}>
        <Text style={{ color: '#fff' }}>Camera not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {streamStatus === 'connected' && remoteStream && RTCViewComponent ? (
        <RTCViewComponent
          streamURL={remoteStream.toURL()}
          style={StyleSheet.absoluteFill}
          objectFit="cover"
        />
      ) : (
        <LinearGradient colors={camera.thumbnailGradient} style={StyleSheet.absoluteFill} />
      )}

      {camera.status === 'online' && streamStatus === 'connecting' && (
        <View style={[StyleSheet.absoluteFill, styles.centerOverlay]} pointerEvents="none">
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}

      {camera.status === 'online' && streamStatus === 'unavailable' && (
        <View style={[StyleSheet.absoluteFill, styles.centerOverlay]} pointerEvents="none">
          <Icon name="alertTriangle" size={24} color="#fff" />
          <Text style={styles.streamErrorText}>
            Live streaming needs a development build — it isn't available in Expo Go.
          </Text>
        </View>
      )}

      {camera.status === 'online' && streamStatus === 'error' && (
        <View style={[StyleSheet.absoluteFill, styles.centerOverlay]} pointerEvents="none">
          <Icon name="alertTriangle" size={24} color="#fff" />
          <Text style={styles.streamErrorText}>{streamError ?? 'Unable to load the stream.'}</Text>
        </View>
      )}

      {camera.status === 'offline' && (
        <View style={[StyleSheet.absoluteFill, styles.centerOverlay]} pointerEvents="none">
          <Icon name="cameraOff" size={24} color="rgba(255,255,255,0.85)" />
          <Text style={styles.streamErrorText}>This camera is offline.</Text>
        </View>
      )}

      <View
        style={[
          styles.topBar,
          { paddingTop: insets.top + spacing.xs, paddingHorizontal: spacing.md },
        ]}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          style={[styles.iconButton, { backgroundColor: 'rgba(6,9,12,0.55)' }]}
          accessibilityRole="button"
          accessibilityLabel="Close live view"
        >
          <Icon name="xClose" size={18} color="#fff" />
        </Pressable>

        <View style={{ alignItems: 'center' }}>
          <Text style={[styles.cameraName, { fontFamily: fontFamily.bodySemibold }]}>
            {camera.name}
          </Text>
          <StatusBadge
            variant={camera.status === 'offline' ? 'offline' : recording ? 'live' : 'online'}
            label={camera.status === 'offline' ? 'Offline' : recording ? 'LIVE' : 'Online'}
            pulsing={recording}
          />
        </View>

        <View style={[styles.iconButton, { backgroundColor: 'rgba(6,9,12,0.55)' }]}>
          <Icon name="signalBars" size={16} color="#fff" />
        </View>
      </View>

      {camera.supportsPtz && (
        <View style={[styles.ptzWrap, { bottom: insets.bottom + 180 }]}>
          <View
            style={[
              styles.ptzPad,
              { backgroundColor: 'rgba(6,9,12,0.5)', borderRadius: radii.full },
            ]}
          >
            <View style={{ transform: [{ rotate: '180deg' }] }}>
              <Icon name="chevronDown" size={18} color="#fff" />
            </View>
          </View>
        </View>
      )}

      <View
        style={[
          styles.bottomBar,
          { paddingBottom: insets.bottom + spacing.lg, paddingHorizontal: spacing.xl },
        ]}
      >
        <ControlButton
          icon={muted ? 'micOff' : 'micOn'}
          active={!muted}
          onPress={() => setMuted((m) => !m)}
          label="Mic"
        />
        <ControlButton
          icon={speakerOn ? 'speakerOn' : 'speakerOff'}
          active={speakerOn}
          onPress={() => setSpeakerOn((s) => !s)}
          label="Speaker"
        />
        <ControlButton
          icon="film"
          active={recording}
          danger={recording}
          onPress={() => setRecording((r) => !r)}
          label={recording ? 'Stop' : 'Record'}
        />
        <ControlButton icon="download" active onPress={() => {}} label="Snapshot" />
        <ControlButton icon="fullscreen" active onPress={() => {}} label="Expand" />
      </View>
    </View>
  );
}

function ControlButton({
  icon,
  label,
  active,
  danger,
  onPress,
}: {
  icon: IconName;
  label: string;
  active?: boolean;
  danger?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.controlButton}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View
        style={[
          styles.controlCircle,
          {
            backgroundColor: danger
              ? 'rgba(255,90,95,0.85)'
              : active
                ? 'rgba(255,255,255,0.18)'
                : 'rgba(6,9,12,0.55)',
          },
        ]}
      >
        <Icon name={icon} size={19} color="#fff" />
      </View>
      <Text style={styles.controlLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },
  notFound: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  centerOverlay: { alignItems: 'center', justifyContent: 'center', gap: 10 },
  streamErrorText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12.5,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraName: { color: '#fff', fontSize: 14, marginBottom: 4 },
  ptzWrap: { position: 'absolute', right: 20 },
  ptzPad: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  controlButton: { alignItems: 'center', gap: 6 },
  controlCircle: {
    width: 50,
    height: 50,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 10.5 },
});
