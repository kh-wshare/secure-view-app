import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NotificationsStackParamList } from './types';
import { NotificationsFeedScreen } from '@/features/notifications/screens/NotificationsFeedScreen';
import { EventDetailsScreen } from '@/features/events/screens/EventDetailsScreen';

const Stack = createNativeStackNavigator<NotificationsStackParamList>();

export function NotificationsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="NotificationsFeed" component={NotificationsFeedScreen} />
      <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
    </Stack.Navigator>
  );
}
