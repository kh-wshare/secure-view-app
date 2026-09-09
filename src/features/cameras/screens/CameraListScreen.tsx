import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, TagGroup } from 'heroui-native';
import { useTheme } from '@/theme';
import { Icon } from '@/components/Icon';
import { Card, StatusBadge, EmptyState, ErrorState, LoadingSkeleton } from '@/components';
import { useCameraStore } from '@/store/useCameraStore';
import type { CamerasStackParamList } from '@/core/navigation/types';
import type { Camera } from '@/types/domain';

type Nav = NativeStackNavigationProp<CamerasStackParamList, 'CameraList'>;

type Filter = 'all' | 'online' | 'offline' | 'favorites';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'online', label: 'Online' },
  { key: 'offline', label: 'Offline' },
  { key: 'favorites', label: 'Favorites' },
];

export function CameraListScreen() {
  const { colors, spacing, radii, fontFamily } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const cameras = useCameraStore((s) => s.cameras);
  const status = useCameraStore((s) => s.status);
  const error = useCameraStore((s) => s.error);
  const fetchCameras = useCameraStore((s) => s.fetchCameras);
  const toggleFavorite = useCameraStore((s) => s.toggleFavorite);
  const [filter, setFilter] = useState<Filter>('all');

  useFocusEffect(
    useCallback(() => {
      fetchCameras();
    }, [fetchCameras]),
  );

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
        <Button
          variant="primary"
          isIconOnly
          onPress={() => navigation.navigate('AddCamera')}
          accessibilityLabel="Add camera"
        >
          <Icon name="plus" size={20} color="#06110E" />
        </Button>
      </View>

      <TagGroup
        selectionMode="single"
        selectedKeys={new Set([filter])}
        onSelectionChange={(keys) => {
          const next = Array.from(keys)[0];
          if (typeof next === 'string') setFilter(next as Filter);
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

      <FlatList
        data={filtered}
        keyExtractor={(c) => c.id}
        numColumns={2}
        columnWrapperStyle={{ gap: spacing.sm }}
        contentContainerStyle={{
          flexGrow: 1,
          padding: spacing.md,
          paddingTop: spacing.xs,
          gap: spacing.sm,
          paddingBottom: 140,
        }}
        refreshControl={
          <RefreshControl
            // refreshing={status === 'loading' && cameras.length > 0}
            onRefresh={fetchCameras}
            tintColor={colors.brand}
          />
        }
        ListEmptyComponent={
          status === 'loading' ? (
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <LoadingSkeleton width="48%" height={150} radius={radii.lg} />
              <LoadingSkeleton width="48%" height={150} radius={radii.lg} />
            </View>
          ) : status === 'error' ? (
            <ErrorState
              icon="alertTriangle"
              title="Couldn't load cameras"
              message={error ?? 'Something went wrong.'}
              actions={[{ label: 'Retry', onPress: fetchCameras, primary: true }]}
            />
          ) : (
            <EmptyState
              icon="cameraOff"
              title="No cameras match"
              message="Try a different filter, or add a new camera to your account."
            />
          )
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
