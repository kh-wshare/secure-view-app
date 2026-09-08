import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme';
import { Icon, IconName } from '@/components/Icon';
import { StatusBadge } from '@/components';
import { useCameraStore } from '@/store/useCameraStore';
import type { HomeStackParamList } from '@/app/navigation/types';

type Rt = RouteProp<HomeStackParamList, 'LiveView'>;

/**
 * Full-screen live view. This is a functional shell wired to real camera
 * data and controls (mute, speaker, record, PTZ, close) — the actual video
 * pipeline is a placeholder gradient until a streaming SDK is integrated.
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

  if (!camera) {
    return (
      <View style={styles.notFound}>
        <Text style={{ color: '#fff' }}>Camera not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <LinearGradient colors={camera.thumbnailGradient} style={StyleSheet.absoluteFill} />

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
