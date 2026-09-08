import React from 'react';
import { View } from 'react-native';
import { Button, Dialog } from 'heroui-native';
import { useTheme } from '@/theme';
import { Icon } from '@/components/Icon';

export type ConfirmationDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Danger styling (red) for destructive actions like "Remove camera" or "Sign out". Defaults to true. */
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Shared confirmation dialog for every destructive/irreversible action in the app:
 * remove camera, revoke share access, delete recording, sign out, etc.
 * Per the design system this is the ONLY pattern used for such confirmations —
 * never a native Alert.alert, so the styling stays on-brand across platforms.
 */
export function ConfirmationDialog({
  visible,
  title,
  message,
  confirmLabel = 'Remove',
  cancelLabel = 'Cancel',
  destructive = true,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  const { colors } = useTheme();

  return (
    <Dialog
      isOpen={visible}
      onOpenChange={(open) => {
        // Fires for backdrop taps and swipe-to-dismiss too, not just the
        // explicit Cancel button — treat every non-confirm close as cancel.
        if (!open) onCancel();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content isSwipeable={false}>
          <View
            className={`self-center size-12 items-center justify-center rounded-full ${
              destructive ? 'bg-danger/15' : 'bg-accent/15'
            }`}
          >
            <Icon name="alertTriangle" size={22} color={destructive ? colors.live : colors.brand} />
          </View>

          <View className="mt-4 mb-1 gap-1.5">
            <Dialog.Title className="text-center">{title}</Dialog.Title>
            <Dialog.Description className="text-center">{message}</Dialog.Description>
          </View>

          <View className="mt-5 flex-row gap-3">
            <Button variant="secondary" className="flex-1" onPress={onCancel}>
              <Button.Label>{cancelLabel}</Button.Label>
            </Button>
            <Button
              variant={destructive ? 'danger' : 'primary'}
              className="flex-1"
              onPress={onConfirm}
            >
              <Button.Label>{confirmLabel}</Button.Label>
            </Button>
          </View>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
