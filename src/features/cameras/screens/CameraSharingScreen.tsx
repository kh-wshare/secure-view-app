import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '@/theme';
import { Icon } from '@/components/Icon';
import { Card, PrimaryButton, ScreenHeader, ConfirmationDialog } from '@/components';
import { useCameraStore } from '@/store/useCameraStore';
import { mockSharedUsers } from '@/services/mock/sharedUsers.mock';
import type { CamerasStackParamList } from '@/app/navigation/types';
import type { SharedUser } from '@/types/domain';

type Rt = RouteProp<CamerasStackParamList, 'CameraSharing'>;

export function CameraSharingScreen() {
  const { colors, spacing, radii, fontFamily } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<Rt>();
  const camera = useCameraStore((s) => s.getById(route.params.cameraId));
  const [users, setUsers] = useState<SharedUser[]>(mockSharedUsers);
  const [pendingRemoval, setPendingRemoval] = useState<SharedUser | null>(null);

  const confirmRemove = () => {
    if (!pendingRemoval) return;
    setUsers((prev) => prev.filter((u) => u.id !== pendingRemoval.id));
    setPendingRemoval(null);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScreenHeader
        title="Shared access"
        subtitle={camera?.name}
        onBack={() => navigation.goBack()}
      />

      <FlatList
        data={users}
        keyExtractor={(u) => u.id}
        contentContainerStyle={{ padding: spacing.md, gap: spacing.sm, paddingBottom: 60 }}
        ListHeaderComponent={
          <Text
            style={[
              styles.intro,
              {
                fontFamily: fontFamily.bodyRegular,
                color: colors.textSecondary,
                marginBottom: spacing.md,
              },
            ]}
          >
            People with access can view live footage and receive alerts from{' '}
            {camera?.name ?? 'this camera'}.
          </Text>
        }
        ListFooterComponent={<PrimaryButton label="Invite someone" onPress={() => {}} />}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => (
          <Card style={styles.row}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: item.avatarTint + '2A', borderRadius: radii.full },
              ]}
            >
              <Text
                style={[
                  styles.avatarText,
                  { color: item.avatarTint, fontFamily: fontFamily.bodySemibold },
                ]}
              >
                {item.initials}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.name,
                  { fontFamily: fontFamily.bodySemibold, color: colors.textPrimary },
                ]}
              >
                {item.name}
              </Text>
              <Text
                style={[
                  styles.access,
                  { fontFamily: fontFamily.bodyRegular, color: colors.textSecondary },
                ]}
              >
                {item.accessSummary}
              </Text>
            </View>
            <Pressable
              onPress={() => setPendingRemoval(item)}
              hitSlop={8}
              accessibilityLabel={`Remove ${item.name}`}
            >
              <Icon name="trash" size={17} color={colors.live} />
            </Pressable>
          </Card>
        )}
      />

      <ConfirmationDialog
        visible={pendingRemoval !== null}
        title="Remove access?"
        message={
          pendingRemoval
            ? `${pendingRemoval.name} will no longer be able to view this camera or receive its alerts.`
            : ''
        }
        confirmLabel="Remove"
        onCancel={() => setPendingRemoval(null)}
        onConfirm={confirmRemove}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  intro: { fontSize: 12.5, lineHeight: 18 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 13 },
  name: { fontSize: 13.5 },
  access: { fontSize: 11.5, marginTop: 1 },
});
