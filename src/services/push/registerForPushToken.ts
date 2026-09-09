import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { PushPlatform } from '@/services/api/notifications.api';

export type PushRegistration = { platform: PushPlatform; token: string };

/**
 * Requests notification permission and returns an Expo push token, or null
 * if permission was denied or no EAS `projectId` is configured (push tokens
 * require one — see `app.json`'s `extra.eas.projectId` once this app is
 * registered with EAS). Never throws — callers treat push as best-effort.
 */
export async function registerForPushToken(): Promise<PushRegistration | null> {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let status = existing;
    if (status !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync();
      status = requested.status;
    }
    if (status !== 'granted') return null;

    const { data: token } = await Notifications.getExpoPushTokenAsync();
    const platform: PushPlatform =
      Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web';
    return { platform, token };
  } catch {
    return null;
  }
}
