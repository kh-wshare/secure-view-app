import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme';
import { Icon } from '@/components/Icon';
import { Card, EmptyState, ScreenHeader } from '@/components';
import { useCameraStore } from '@/store/useCameraStore';
import { formatDuration, formatEventTime } from '@/utils/format';
import type { CamerasStackParamList } from '@/core/navigation/types';

type Rt = RouteProp<CamerasStackParamList, 'Recordings'>;

type Recording = {
  id: string;
  startedAt: string;
  durationSeconds: number;
  trigger: 'motion' | 'manual' | 'scheduled';
};

export function RecordingsScreen() {
  const { colors, spacing, radii, fontFamily } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<Rt>();
  const camera = useCameraStore((s) => s.getById(route.params.cameraId));

  // Placeholder recording fixtures derived from the camera id so each camera
  // shows a stable, distinct list — swap for a real recordings API/query later.
  const recordings = useMemo<Recording[]>(() => {
    const now = Date.now();
    return [0, 1, 2, 3, 4].map((i) => ({
      id: `${route.params.cameraId}-rec-${i}`,
      startedAt: new Date(now - (i * 3 + 1) * 3600_000).toISOString(),
      durationSeconds: 300 + i * 145,
      trigger: i % 3 === 0 ? 'motion' : i % 3 === 1 ? 'manual' : 'scheduled',
    }));
  }, [route.params.cameraId]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScreenHeader title="Recordings" subtitle={camera?.name} onBack={() => navigation.goBack()} />
      <FlatList
        data={recordings}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ padding: spacing.md, gap: spacing.sm, paddingBottom: 60 }}
        ListEmptyComponent={
          <EmptyState
            icon="film"
            title="No recordings yet"
            message="Recorded clips from this camera will appear here."
          />
        }
        renderItem={({ item }) => (
          <Pressable>
            <Card style={{ flexDirection: 'row', gap: spacing.sm, padding: spacing.sm }}>
              <LinearGradient
                colors={camera?.thumbnailGradient ?? ['#1D3A38', '#0E1B1C']}
                style={[styles.thumb, { borderRadius: radii.sm }]}
              >
                <Icon name="play" size={16} color="#fff" filled />
                <Text style={styles.duration}>{formatDuration(item.durationSeconds)}</Text>
              </LinearGradient>
              <View style={{ flex: 1, justifyContent: 'center' }}>
                <Text
                  style={[
                    styles.rowTitle,
                    { fontFamily: fontFamily.bodySemibold, color: colors.textPrimary },
                  ]}
                >
                  {formatEventTime(item.startedAt)}
                </Text>
                <Text
                  style={[
                    styles.rowMeta,
                    { fontFamily: fontFamily.bodyRegular, color: colors.textSecondary },
                  ]}
                >
                  {item.trigger === 'motion'
                    ? 'Motion-triggered'
                    : item.trigger === 'manual'
                      ? 'Manual recording'
                      : 'Scheduled recording'}
                </Text>
              </View>
              <Pressable hitSlop={8} accessibilityLabel="Download recording">
                <Icon name="download" size={17} color={colors.textSecondary} />
              </Pressable>
            </Card>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  thumb: { width: 88, height: 62, alignItems: 'center', justifyContent: 'center', gap: 4 },
  duration: { color: '#fff', fontSize: 9.5, fontFamily: 'IBMPlexMono_400Regular' },
  rowTitle: { fontSize: 13 },
  rowMeta: { fontSize: 11, marginTop: 2 },
});
