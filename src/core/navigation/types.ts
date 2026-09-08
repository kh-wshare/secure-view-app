import type { NavigatorScreenParams } from '@react-navigation/native';

/** Home tab stack: dashboard + the screens reached only from it. */
export type HomeStackParamList = {
  HomeDashboard: undefined;
  LiveView: { cameraId: string };
  QrScanner: undefined;
};

/** Cameras tab stack: list, per-camera detail, add-camera flow, sharing. */
export type CamerasStackParamList = {
  CameraList: undefined;
  CameraDetails: { cameraId: string };
  LiveView: { cameraId: string };
  AddCamera: undefined;
  QrScanner: undefined;
  CameraSharing: { cameraId: string };
  Recordings: { cameraId: string };
};

/** Events tab stack: feed + detail. */
export type EventsStackParamList = {
  EventsFeed: undefined;
  EventDetails: { eventId: string };
  LiveView: { cameraId: string };
};

/** Notifications tab stack. */
export type NotificationsStackParamList = {
  NotificationsFeed: undefined;
  EventDetails: { eventId: string };
};

/** Profile tab stack: account, settings, and screens reached from Profile. */
export type ProfileStackParamList = {
  ProfileHome: undefined;
  CameraSharing: { cameraId: string };
};

export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  CamerasTab: NavigatorScreenParams<CamerasStackParamList>;
  EventsTab: NavigatorScreenParams<EventsStackParamList>;
  NotificationsTab: NavigatorScreenParams<NotificationsStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
