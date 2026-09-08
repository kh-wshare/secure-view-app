import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { useTheme } from '@/theme';
import { Icon } from '@/components/Icon';
import { PrimaryButton } from '@/components';

export function QrScannerScreen() {
  const { colors, spacing, radii, fontFamily } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const handleScan = (_result: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);
    // In a real integration this would validate _result.data against the
    // camera-pairing payload and register the device with the backend.
    setTimeout(() => navigation.goBack(), 900);
  };

  if (!permission) {
    return <View style={[styles.screen, { backgroundColor: colors.bg }]} />;
  }

  if (!permission.granted) {
    return (
      <View
        style={[
          styles.screen,
          styles.centered,
          { backgroundColor: colors.bg, padding: spacing.xl, gap: spacing.md },
        ]}
      >
        <Icon name="qrCode" size={32} color={colors.textSecondary} />
        <Text
          style={[
            styles.permTitle,
            { fontFamily: fontFamily.displaySemibold, color: colors.textPrimary },
          ]}
        >
          Camera access needed
        </Text>
        <Text
          style={[
            styles.permBody,
            { fontFamily: fontFamily.bodyRegular, color: colors.textSecondary },
          ]}
        >
          SecureView needs camera access to scan the QR code printed on your device.
        </Text>
        <PrimaryButton label="Grant camera access" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleScan}
      />

      <View
        style={[
          styles.topBar,
          { paddingTop: insets.top + spacing.xs, paddingHorizontal: spacing.md },
        ]}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          style={[styles.closeButton, { backgroundColor: 'rgba(6,9,12,0.55)' }]}
          accessibilityRole="button"
          accessibilityLabel="Close scanner"
        >
          <Icon name="xClose" size={18} color="#fff" />
        </Pressable>
      </View>

      <View style={styles.overlay} pointerEvents="none">
        <View
          style={[
            styles.frame,
            {
              borderColor: scanned ? colors.brand : 'rgba(255,255,255,0.85)',
              borderRadius: radii.lg,
            },
          ]}
        />
        <Text style={styles.helperText}>
          {scanned ? 'Camera found!' : 'Align the QR code within the frame'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },
  centered: { alignItems: 'center', justifyContent: 'center' },
  permTitle: { fontSize: 16, textAlign: 'center' },
  permBody: { fontSize: 13, textAlign: 'center', lineHeight: 19 },
  topBar: { flexDirection: 'row' },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 },
  frame: { width: 240, height: 240, borderWidth: 3 },
  helperText: { color: '#fff', fontSize: 13 },
});
