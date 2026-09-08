import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
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
  const { colors, radii, spacing, fontFamily } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onCancel}
          accessibilityLabel="Dismiss dialog"
        />
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.bgElevated,
              borderColor: colors.border,
              borderRadius: radii.lg,
              padding: spacing.xl,
              gap: spacing.md,
            },
          ]}
        >
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: destructive ? colors.liveTint : colors.brandTint },
            ]}
          >
            <Icon name="alertTriangle" size={22} color={destructive ? colors.live : colors.brand} />
          </View>

          <Text
            style={[
              styles.title,
              { fontFamily: fontFamily.displaySemibold, color: colors.textPrimary },
            ]}
          >
            {title}
          </Text>
          <Text
            style={[
              styles.message,
              { fontFamily: fontFamily.bodyRegular, color: colors.textSecondary },
            ]}
          >
            {message}
          </Text>

          <View style={[styles.actions, { gap: spacing.sm }]}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [
                styles.button,
                {
                  backgroundColor: colors.bgElevated2,
                  borderRadius: radii.md,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.buttonLabel,
                  { fontFamily: fontFamily.bodyBold, color: colors.textPrimary },
                ]}
              >
                {cancelLabel}
              </Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.button,
                {
                  backgroundColor: destructive ? colors.live : colors.brand,
                  borderRadius: radii.md,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
              accessibilityRole="button"
            >
              <Text
                style={[styles.buttonLabel, { fontFamily: fontFamily.bodyBold, color: '#06110E' }]}
              >
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(4,8,10,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  card: { width: '100%', maxWidth: 360, borderWidth: 1, alignItems: 'center' },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 16, textAlign: 'center' },
  message: { fontSize: 13, textAlign: 'center', lineHeight: 19 },
  actions: { flexDirection: 'row', width: '100%' },
  button: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  buttonLabel: { fontSize: 14 },
});
