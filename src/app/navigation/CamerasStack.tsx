import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { CamerasStackParamList } from './types';
import { CameraListScreen } from '@/features/cameras/screens/CameraListScreen';
import { CameraDetailsScreen } from '@/features/cameras/screens/CameraDetailsScreen';
import { LiveViewScreen } from '@/features/live-view/screens/LiveViewScreen';
import { AddCameraScreen } from '@/features/add-camera/screens/AddCameraScreen';
import { CameraSharingScreen } from '@/features/cameras/screens/CameraSharingScreen';
import { RecordingsScreen } from '@/features/recordings/screens/RecordingsScreen';
import { QrScannerScreen } from '@/features/add-camera/screens/QrScannerScreen';

const Stack = createNativeStackNavigator<CamerasStackParamList>();

export function CamerasStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CameraList" component={CameraListScreen} />
      <Stack.Screen name="CameraDetails" component={CameraDetailsScreen} />
      <Stack.Screen
        name="LiveView"
        component={LiveViewScreen}
        options={{ presentation: 'fullScreenModal' }}
      />
      <Stack.Screen
        name="AddCamera"
        component={AddCameraScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="QrScanner"
        component={QrScannerScreen}
        options={{ presentation: 'fullScreenModal' }}
      />
      <Stack.Screen name="CameraSharing" component={CameraSharingScreen} />
      <Stack.Screen name="Recordings" component={RecordingsScreen} />
    </Stack.Navigator>
  );
}
