import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Avatar, Button, ListGroup, Separator } from 'heroui-native';
import { useTheme } from '@/theme';
import { Icon } from '@/components/Icon';
import { EmptyState, PrimaryButton, ScreenHeader, ConfirmationDialog } from '@/components';
import { useCameraStore } from '@/store/useCameraStore';
import { mockSharedUsers } from '@/services/mock/sharedUsers.mock';
import type { CamerasStackParamList } from '@/core/navigation/types';
import type { SharedUser } from '@/types/domain';

type Rt = RouteProp<CamerasStackParamList, 'CameraSharing'>;

export function CameraSharingScreen() {
  const { colors, spacing, fontFamily } = useTheme();
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

      <ScrollView contentContainerStyle={{ padding: spacing.md, gap: spacing.md, flexGrow: 1 }}>
        <Text
          style={[
            styles.intro,
            { fontFamily: fontFamily.bodyRegular, color: colors.textSecondary },
          ]}
        >
          People with access can view live footage and receive alerts from{' '}
          {camera?.name ?? 'this camera'}.
        </Text>

        {users.length === 0 ? (
          <EmptyState
            icon="share"
            title="No one has access yet"
            message="Invite someone to let them view this camera's live footage and alerts."
          />
        ) : (
          <ListGroup>
            {users.map((item, index) => (
              <React.Fragment key={item.id}>
                {index > 0 && <Separator className="mx-4" />}
                <ListGroup.Item disabled>
                  <ListGroup.ItemPrefix>
                    <Avatar style={{ backgroundColor: item.avatarTint + '2A' }}>
                      <Avatar.Fallback textProps={{ style: { color: item.avatarTint } }}>
                        {item.initials}
                      </Avatar.Fallback>
                    </Avatar>
                  </ListGroup.ItemPrefix>
                  <ListGroup.ItemContent>
                    <ListGroup.ItemTitle>{item.name}</ListGroup.ItemTitle>
                    <ListGroup.ItemDescription>{item.accessSummary}</ListGroup.ItemDescription>
                  </ListGroup.ItemContent>
                  <ListGroup.ItemSuffix>
                    <Button
                      size="sm"
                      variant="danger"
                      isIconOnly
                      onPress={() => setPendingRemoval(item)}
                      accessibilityLabel={`Remove ${item.name}`}
                    >
                      <Icon name="trash" size={16} color={colors.live} />
                    </Button>
                  </ListGroup.ItemSuffix>
                </ListGroup.Item>
              </React.Fragment>
            ))}
          </ListGroup>
        )}

        <View style={{ marginTop: 'auto' }}>
          <PrimaryButton label="Invite someone" onPress={() => {}} />
        </View>
      </ScrollView>

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
});
