import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme';
import { Icon } from '@/components/Icon';
import { Card, StatusBadge, EmptyState } from '@/components';
import { useCameraStore } from '@/store/useCameraStore';
import type { CamerasStackParamList } from '@/core/navigation/types';
import type { Camera } from '@/types/domain';

type Nav = NativeStackNavigationProp<CamerasStackParamList, 'CameraList'>;

type Filter = 'all' | 'online' | 'offline' | 'favorites';

export function CameraListScreen() {
  const { colors, spacing, radii, fontFamily } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const cameras = useCameraStore((s) => s.cameras);
  const toggleFavorite = useCameraStore((s) => s.toggleFavorite);
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = cameras.filter((c) => {
    if (filter === 'online') return c.status === 'online';
    if (filter === 'offline') return c.status === 'offline';
    if (filter === 'favorites') return c.favorited;
    return true;
  });

  return (
    <View
      style={[styles.screen, { backgroundColor: colors.bg, paddingTop: insets.top + spacing.sm }]}
    >
      <View style={[styles.headerRow, { paddingHorizontal: spacing.md }]}>
        <Text
          style={[styles.title, { fontFamily: fontFamily.displayBold, color: colors.textPrimary }]}
        >
          Cameras
        </Text>
        <Pressable
          onPress={() => navigation.navigate('AddCamera')}
          style={[styles.addButton, { backgroundColor: colors.brand, borderRadius: radii.full }]}
          accessibilityRole="button"
          accessibilityLabel="Add camera"
        >
          <Icon name="plus" size={20} color="#06110E" />
        </Pressable>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={['all', 'online', 'offline', 'favorites'] as Filter[]}
        keyExtractor={(f) => f}
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          gap: spacing.xs,
          paddingVertical: spacing.sm,
        }}
        renderItem={({ item }) => {
          const active = filter === item;
          return (
            <Pressable
              onPress={() => setFilter(item)}
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
                {item === 'all'
                  ? 'All'
                  : item === 'online'
                    ? 'Online'
                    : item === 'offline'
                      ? 'Offline'
                      : 'Favorites'}
              </Text>
            </Pressable>
          );
        }}
      />

      <FlatList
        data={filtered}
        keyExtractor={(c) => c.id}
        numColumns={2}
        columnWrapperStyle={{ gap: spacing.sm }}
        contentContainerStyle={{
          padding: spacing.md,
          paddingTop: spacing.xs,
          gap: spacing.sm,
          paddingBottom: 140,
        }}
        ListEmptyComponent={
          <EmptyState
            icon="cameraOff"
            title="No cameras match"
            message="Try a different filter, or add a new camera to your account."
          />
        }
        renderItem={({ item }) => (
          <CameraGridCard
            camera={item}
            onPress={() => navigation.navigate('CameraDetails', { cameraId: item.id })}
            onToggleFavorite={() => toggleFavorite(item.id)}
          />
        )}
      />
    </View>
  );
}

function CameraGridCard({
  camera,
  onPress,
  onToggleFavorite,
}: {
  camera: Camera;
  onPress: () => void;
  onToggleFavorite: () => void;
}) {
  const { colors, fontFamily, spacing } = useTheme();
  return (
    <Pressable onPress={onPress} style={{ flex: 1 }}>
      <Card style={{ padding: 0, overflow: 'hidden', gap: 0 }}>
        <LinearGradient colors={camera.thumbnailGradient} style={styles.thumb}>
          <View style={styles.thumbTopRow}>
            <StatusBadge
              variant={
                camera.status === 'offline' ? 'offline' : camera.recording ? 'recording' : 'online'
              }
              label={camera.status === 'offline' ? 'Offline' : camera.recording ? 'REC' : 'Online'}
              pulsing={camera.recording}
            />
            <Pressable onPress={onToggleFavorite} hitSlop={8} accessibilityLabel="Toggle favorite">
              <Icon
                name="star"
                size={16}
                color={camera.favorited ? colors.warning : 'rgba(255,255,255,0.7)'}
                filled={camera.favorited}
              />
            </Pressable>
          </View>
          {camera.status === 'offline' && (
            <View style={styles.offlineOverlay}>
              <Icon name="cameraOff" size={22} color="rgba(255,255,255,0.85)" />
            </View>
          )}
        </LinearGradient>
        <View style={{ padding: spacing.sm, gap: 2 }}>
          <Text
            numberOfLines={1}
            style={[
              styles.cardName,
              { fontFamily: fontFamily.bodySemibold, color: colors.textPrimary },
            ]}
          >
            {camera.name}
          </Text>
          <Text
            numberOfLines={1}
            style={[
              styles.cardLocation,
              { fontFamily: fontFamily.bodyRegular, color: colors.textSecondary },
            ]}
          >
            {camera.location}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 26 },
  addButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  chip: { borderWidth: 1, paddingVertical: 8, paddingHorizontal: 14 },
  chipLabel: { fontSize: 12.5 },
  thumb: { height: 104, padding: 8, justifyContent: 'space-between' },
  thumbTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  offlineOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardName: { fontSize: 13.5 },
  cardLocation: { fontSize: 11 },
});
