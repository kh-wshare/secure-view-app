export type CameraStatus = 'online' | 'offline';

export type Camera = {
  id: string;
  name: string;
  location: string;
  status: CameraStatus;
  /** Exact server status (`PROVISIONING` | `ONLINE` | `OFFLINE` | `DISABLED`) for screens that need finer detail than the online/offline split above. */
  rawStatus: string;
  deviceId: string | null;
  motionSensitivity: number;
  recording: boolean;
  motionRecent: boolean;
  lastMotionText: string;
  /** Client-only, persisted locally (AsyncStorage) — there is no favorite field on the API. */
  favorited: boolean;
  supportsPtz: boolean;
  thumbnailGradient: [string, string];
};

export type UserRole = string;
export type UserStatus = string;

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
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
