import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@/theme';
import { Icon } from '@/components/Icon';
import { Card, PrimaryButton, SecondaryButton, ScreenHeader } from '@/components';
import { useCameraStore } from '@/store/useCameraStore';
import { ApiError } from '@/services/api/ApiError';
import type { CamerasStackParamList } from '@/core/navigation/types';

type Nav = NativeStackNavigationProp<CamerasStackParamList, 'AddCamera'>;
type Rt = RouteProp<CamerasStackParamList, 'AddCamera'>;

type Step = 'method' | 'manual' | 'success';

export function AddCameraScreen() {
  const { colors, spacing, fontFamily } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const scannedDeviceId = route.params?.scannedDeviceId;
  const scannedProvisioningToken = route.params?.scannedProvisioningToken;

  const [step, setStep] = useState<Step>(scannedDeviceId ? 'manual' : 'method');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [rtspHost, setRtspHost] = useState('');
  const [rtspPath, setRtspPath] = useState('');
  const [rtspUsername, setRtspUsername] = useState('');
  const [rtspPassword, setRtspPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cameras = useCameraStore((s) => s.cameras);
  const createCamera = useCameraStore((s) => s.createCamera);
  const [createdCameraId, setCreatedCameraId] = useState<string | null>(null);

  useEffect(() => {
    if (scannedDeviceId) setStep('manual');
  }, [scannedDeviceId]);

  const isClaimingScannedDevice = Boolean(scannedDeviceId);

  const handleAdd = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const camera = await createCamera({
        name: name.trim(),
        location: location.trim() || undefined,
        deviceId: scannedDeviceId,
        provisioningToken: scannedProvisioningToken,
        rtsp: {
          host: rtspHost.trim(),
          path: rtspPath.trim() || undefined,
          username: rtspUsername.trim() || undefined,
          password: rtspPassword || undefined,
        },
      });
      setCreatedCameraId(camera.id);
      setStep('success');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to add this camera.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScreenHeader
        title={step === 'success' ? 'Camera added' : 'Add a camera'}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={{
          padding: spacing.md,
          paddingBottom: insets.bottom + 40,
          gap: spacing.lg,
        }}
      >
        {step === 'method' && (
          <View style={{ gap: spacing.sm }}>
            <Text
              style={[
                styles.intro,
                { fontFamily: fontFamily.bodyRegular, color: colors.textSecondary },
              ]}
            >
              Choose how you'd like to connect your new camera.
            </Text>
            <Pressable onPress={() => navigation.navigate('QrScanner')}>
              <Card style={styles.optionRow}>
                <View style={[styles.optionIcon, { backgroundColor: colors.brandTint }]}>
                  <Icon name="qrCode" size={20} color={colors.brand} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.optionTitle,
                      { fontFamily: fontFamily.bodySemibold, color: colors.textPrimary },
                    ]}
                  >
                    Scan QR code
                  </Text>
                  <Text
                    style={[
                      styles.optionBody,
                      { fontFamily: fontFamily.bodyRegular, color: colors.textSecondary },
                    ]}
                  >
                    Fastest way — scan the code on your camera or its box.
                  </Text>
                </View>
                <Icon name="chevronRight" size={16} color={colors.textTertiary} />
              </Card>
            </Pressable>
            <Pressable onPress={() => setStep('manual')}>
              <Card style={styles.optionRow}>
                <View style={[styles.optionIcon, { backgroundColor: colors.bgElevated2 }]}>
                  <Icon name="pencil" size={18} color={colors.textPrimary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.optionTitle,
                      { fontFamily: fontFamily.bodySemibold, color: colors.textPrimary },
                    ]}
                  >
                    Enter details manually
                  </Text>
                  <Text
                    style={[
                      styles.optionBody,
                      { fontFamily: fontFamily.bodyRegular, color: colors.textSecondary },
                    ]}
                  >
                    Add a camera name and location yourself.
                  </Text>
                </View>
                <Icon name="chevronRight" size={16} color={colors.textTertiary} />
              </Card>
            </Pressable>
          </View>
        )}

        {step === 'manual' && (
          <View style={{ gap: spacing.md }}>
            {isClaimingScannedDevice && (
              <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Icon name="qrCode" size={16} color={colors.brand} />
                <Text
                  style={{
                    flex: 1,
                    fontFamily: fontFamily.bodyMedium,
                    color: colors.textSecondary,
                    fontSize: 12.5,
                  }}
                >
                  Device scanned — enter its RTSP connection details to finish adding it.
                </Text>
              </Card>
            )}
            <Field
              label="Camera name"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Front Door"
            />
            <Field
              label="Location"
              value={location}
              onChangeText={setLocation}
              placeholder="e.g. Entrance"
            />
            <Field
              label="RTSP host"
              value={rtspHost}
              onChangeText={setRtspHost}
              placeholder="e.g. 192.168.1.50:554"
              autoCapitalize="none"
            />
            <Field
              label="RTSP path"
              value={rtspPath}
              onChangeText={setRtspPath}
              placeholder="e.g. /stream1"
              autoCapitalize="none"
            />
            <Field
              label="RTSP username"
              value={rtspUsername}
              onChangeText={setRtspUsername}
              placeholder="Optional"
              autoCapitalize="none"
            />
            <Field
              label="RTSP password"
              value={rtspPassword}
              onChangeText={setRtspPassword}
              placeholder="Optional"
              secureTextEntry
              autoCapitalize="none"
            />

            {error && (
              <Text
                style={{ fontFamily: fontFamily.bodyMedium, color: colors.live, fontSize: 12.5 }}
              >
                {error}
              </Text>
            )}

            <PrimaryButton
              label="Add camera"
              onPress={handleAdd}
              loading={submitting}
              disabled={!name.trim() || !rtspHost.trim()}
            />
            <SecondaryButton label="Back" onPress={() => setStep('method')} />
          </View>
        )}

        {step === 'success' && (
          <View style={[styles.successWrap, { gap: spacing.md }]}>
            <View style={[styles.successIcon, { backgroundColor: colors.brandTint }]}>
              <Icon name="checkCircle" size={28} color={colors.brand} filled={false} />
            </View>
            <Text
              style={[
                styles.successTitle,
                { fontFamily: fontFamily.displaySemibold, color: colors.textPrimary },
              ]}
            >
              {name || 'Camera'} is ready
            </Text>
            <Text
              style={[
                styles.successBody,
                { fontFamily: fontFamily.bodyRegular, color: colors.textSecondary },
              ]}
            >
              Your camera has been added to SecureView. You now have {cameras.length} camera
              {cameras.length === 1 ? '' : 's'}.
            </Text>
            <PrimaryButton
              label="View camera"
              onPress={() => {
                if (createdCameraId) {
                  navigation.replace('CameraDetails', { cameraId: createdCameraId });
                } else {
                  navigation.goBack();
                }
              }}
            />
            <SecondaryButton label="Done" onPress={() => navigation.goBack()} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  autoCapitalize = 'sentences',
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words';
}) {
  const { colors, radii, fontFamily, spacing } = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <Text
        style={[
          styles.fieldLabel,
          { fontFamily: fontFamily.bodySemibold, color: colors.textSecondary },
        ]}
      >
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        style={[
          styles.input,
          {
            backgroundColor: colors.bgElevated2,
            borderColor: colors.border,
            borderRadius: radii.md,
            color: colors.textPrimary,
            fontFamily: fontFamily.bodyRegular,
            paddingHorizontal: spacing.md,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  intro: { fontSize: 13, lineHeight: 19 },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  optionIcon: {
    width: 42,
    height: 42,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTitle: { fontSize: 14 },
  optionBody: { fontSize: 11.5, marginTop: 2 },
  fieldLabel: { fontSize: 11.5, textTransform: 'uppercase', letterSpacing: 0.4 },
  input: { height: 50, borderWidth: 1, fontSize: 14 },
  successWrap: { alignItems: 'center', paddingTop: 20 },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: { fontSize: 17, textAlign: 'center' },
  successBody: { fontSize: 13, textAlign: 'center', lineHeight: 19 },
});
