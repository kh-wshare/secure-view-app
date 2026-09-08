import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@/theme';
import { Icon, IconName } from '@/components/Icon';
import { Card, ToggleSwitch, ConfirmationDialog } from '@/components';
import { useCameraStore } from '@/store/useCameraStore';
import type { ProfileStackParamList } from '@/core/navigation/types';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'ProfileHome'>;

export function ProfileHomeScreen() {
  const { colors, spacing, radii, fontFamily, mode, toggleMode } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const cameras = useCameraStore((s) => s.cameras);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [biometricLock, setBiometricLock] = useState(true);
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  return (
    <View
      style={[styles.screen, { backgroundColor: colors.bg, paddingTop: insets.top + spacing.sm }]}
    >
      <ScrollView
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 140, gap: spacing.lg }}
      >
        <Text
          style={[styles.title, { fontFamily: fontFamily.displayBold, color: colors.textPrimary }]}
        >
          Profile
        </Text>

        <View style={styles.identityRow}>
          <View
            style={[styles.avatar, { backgroundColor: colors.brandTint, borderRadius: radii.full }]}
          >
            <Text
              style={[
                styles.avatarInitials,
                { fontFamily: fontFamily.displaySemibold, color: colors.brand },
              ]}
            >
              SV
            </Text>
          </View>
          <View>
            <Text
              style={[
                styles.name,
                { fontFamily: fontFamily.displaySemibold, color: colors.textPrimary },
              ]}
            >
              Vann Soklay
            </Text>
            <Text
              style={[
                styles.email,
                { fontFamily: fontFamily.bodyRegular, color: colors.textSecondary },
              ]}
            >
              soklayvann@gmail.com
            </Text>
          </View>
        </View>

        <SettingsSection title="Account">
          <SettingsRow icon="user" label="Personal information" onPress={() => {}} />
          <SettingsRow
            icon="cameras"
            label={`Cameras (${cameras.length})`}
            onPress={() => navigation.getParent()?.navigate('CamerasTab' as never)}
          />
          <SettingsRow
            icon="share"
            label="Shared access"
            onPress={() => navigation.navigate('CameraSharing', { cameraId: cameras[0]?.id ?? '' })}
          />
        </SettingsSection>

        <SettingsSection title="Security">
          <View style={styles.toggleRow}>
            <View style={styles.toggleLabelWrap}>
              <Icon name="lock" size={17} color={colors.textPrimary} />
              <Text
                style={[
                  styles.rowLabel,
                  { fontFamily: fontFamily.bodyMedium, color: colors.textPrimary },
                ]}
              >
                Require biometric unlock
              </Text>
            </View>
            <ToggleSwitch value={biometricLock} onValueChange={setBiometricLock} />
          </View>
          <SettingsRow icon="shieldCheck" label="Two-factor authentication" onPress={() => {}} />
        </SettingsSection>

        <SettingsSection title="Notifications">
          <View style={styles.toggleRow}>
            <View style={styles.toggleLabelWrap}>
              <Icon name="bell" size={17} color={colors.textPrimary} />
              <Text
                style={[
                  styles.rowLabel,
                  { fontFamily: fontFamily.bodyMedium, color: colors.textPrimary },
                ]}
              >
                Push notifications
              </Text>
            </View>
            <ToggleSwitch value={pushEnabled} onValueChange={setPushEnabled} />
          </View>
        </SettingsSection>

        <SettingsSection title="Appearance">
          <View style={styles.toggleRow}>
            <View style={styles.toggleLabelWrap}>
              <Icon
                name={mode === 'dark' ? 'star' : 'settingsGear'}
                size={17}
                color={colors.textPrimary}
              />
              <Text
                style={[
                  styles.rowLabel,
                  { fontFamily: fontFamily.bodyMedium, color: colors.textPrimary },
                ]}
              >
                Dark mode
              </Text>
            </View>
            <ToggleSwitch value={mode === 'dark'} onValueChange={toggleMode} />
          </View>
        </SettingsSection>

        <SettingsSection title="Storage">
          <SettingsRow icon="storage" label="Manage cloud storage" onPress={() => {}} />
        </SettingsSection>

        <Pressable onPress={() => setConfirmSignOut(true)}>
          <Card style={[styles.signOutRow, { borderColor: colors.live }]}>
            <Text
              style={[
                styles.signOutLabel,
                { fontFamily: fontFamily.bodySemibold, color: colors.live },
              ]}
            >
              Sign out
            </Text>
          </Card>
        </Pressable>
      </ScrollView>

      <ConfirmationDialog
        visible={confirmSignOut}
        title="Sign out of SecureView?"
        message="You'll need to sign back in to view your cameras and receive alerts."
        confirmLabel="Sign out"
        onCancel={() => setConfirmSignOut(false)}
        onConfirm={() => setConfirmSignOut(false)}
      />
    </View>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors, fontFamily, spacing } = useTheme();
  return (
    <View style={{ gap: spacing.xs }}>
      <Text
        style={[
          styles.sectionTitle,
          { fontFamily: fontFamily.bodySemibold, color: colors.textSecondary },
        ]}
      >
        {title.toUpperCase()}
      </Text>
      <Card style={{ padding: 0, gap: 0 }}>{children}</Card>
    </View>
  );
}

function SettingsRow({
  icon,
  label,
  onPress,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
}) {
  const { colors, fontFamily, spacing } = useTheme();
  return (
    <Pressable onPress={onPress} style={[styles.row, { paddingHorizontal: spacing.md }]}>
      <Icon name={icon} size={17} color={colors.textPrimary} />
      <Text
        style={[
          styles.rowLabel,
          { flex: 1, fontFamily: fontFamily.bodyMedium, color: colors.textPrimary },
        ]}
      >
        {label}
      </Text>
      <Icon name="chevronRight" size={16} color={colors.textTertiary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  title: { fontSize: 26 },
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { fontSize: 18 },
  name: { fontSize: 16 },
  email: { fontSize: 12.5, marginTop: 2 },
  sectionTitle: { fontSize: 11, letterSpacing: 0.6, marginLeft: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
  rowLabel: { fontSize: 13.5 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  toggleLabelWrap: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  signOutRow: { alignItems: 'center' },
  signOutLabel: { fontSize: 14 },
});
