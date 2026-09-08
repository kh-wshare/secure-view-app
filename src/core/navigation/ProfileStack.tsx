import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from './types';
import { ProfileHomeScreen } from '@/features/profile/screens/ProfileHomeScreen';
import { CameraSharingScreen } from '@/features/cameras/screens/CameraSharingScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileHome" component={ProfileHomeScreen} />
      <Stack.Screen name="CameraSharing" component={CameraSharingScreen} />
    </Stack.Navigator>
  );
}
