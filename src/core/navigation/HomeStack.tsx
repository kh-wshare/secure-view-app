import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { HomeStackParamList } from './types';
import { HomeDashboardScreen } from '@/features/home/screens/HomeDashboardScreen';
import { LiveViewScreen } from '@/features/live-view/screens/LiveViewScreen';
import { QrScannerScreen } from '@/features/add-camera/screens/QrScannerScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeDashboard" component={HomeDashboardScreen} />
      <Stack.Screen
        name="LiveView"
        component={LiveViewScreen}
        options={{ presentation: 'fullScreenModal' }}
      />
      <Stack.Screen
        name="QrScanner"
        component={QrScannerScreen}
        options={{ presentation: 'fullScreenModal' }}
      />
    </Stack.Navigator>
  );
}
