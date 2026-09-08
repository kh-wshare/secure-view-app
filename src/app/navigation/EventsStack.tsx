import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { EventsStackParamList } from './types';
import { EventsFeedScreen } from '@/features/events/screens/EventsFeedScreen';
import { EventDetailsScreen } from '@/features/events/screens/EventDetailsScreen';
import { LiveViewScreen } from '@/features/live-view/screens/LiveViewScreen';

const Stack = createNativeStackNavigator<EventsStackParamList>();

export function EventsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EventsFeed" component={EventsFeedScreen} />
      <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
      <Stack.Screen
        name="LiveView"
        component={LiveViewScreen}
        options={{ presentation: 'fullScreenModal' }}
      />
    </Stack.Navigator>
  );
}
