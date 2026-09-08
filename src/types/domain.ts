export type CameraStatus = 'online' | 'offline';

export type Camera = {
  id: string;
  name: string;
  location: string;
  status: CameraStatus;
  recording: boolean;
  motionRecent: boolean;
  lastMotionText: string;
  favorited: boolean;
  supportsPtz: boolean;
  thumbnailGradient: [string, string];
};

export type EventType =
  | 'person'
  | 'vehicle'
  | 'motion'
  | 'cameraOnline'
  | 'cameraOffline'
  | 'recordingStarted'
  | 'recordingStopped';

export type EventSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type SecurityEvent = {
  id: string;
  type: EventType;
  severity: EventSeverity;
  cameraId: string;
  cameraName: string;
  occurredAt: string; // ISO timestamp
  durationSeconds: number | null;
  confidence: number | null; // 0-100, for detection events
  reviewed: boolean;
};

export type NotificationItem = {
  id: string;
  type: EventType;
  title: string;
  occurredAt: string; // ISO timestamp
  read: boolean;
};

export type SharedUser = {
  id: string;
  name: string;
  initials: string;
  accessSummary: string;
  avatarTint: string;
};

export type SharePermissions = {
  view: boolean;
  recordings: boolean;
  alerts: boolean;
  control: boolean;
  manage: boolean;
};
