import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from './types';
import { FloatingTabBar } from './FloatingTabBar';
import { HomeStack } from './HomeStack';
import { CamerasStack } from './CamerasStack';
import { EventsStack } from './EventsStack';
import { NotificationsStack } from './NotificationsStack';
import { ProfileStack } from './ProfileStack';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} />
      <Tab.Screen name="CamerasTab" component={CamerasStack} />
      <Tab.Screen name="EventsTab" component={EventsStack} />
      <Tab.Screen name="NotificationsTab" component={NotificationsStack} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} />
    </Tab.Navigator>
  );
}
