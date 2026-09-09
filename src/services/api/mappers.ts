import type {
  Camera,
  EventSeverity,
  EventType,
  NotificationItem,
  SecurityEvent,
  User,
} from '@/types/domain';
import type { ApiCamera, ApiEvent, ApiEventType, ApiNotification, ApiUser } from './types';

export function mapApiUser(u: ApiUser): User {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    status: u.status,
    createdAt: u.created_at,
    updatedAt: u.updated_at,
  };
}

/**
 * Deterministic placeholder gradient for a camera's thumbnail — the API has
 * no video pipeline for still thumbnails, only live WHEP streams, so every
 * camera card needs *some* background until the live tile renders.
 */
const THUMBNAIL_GRADIENTS: [string, string][] = [
  ['#1D3A38', '#0E1B1C'],
  ['#22303B', '#0F1519'],
  ['#3A2E1B', '#17130C'],
  ['#242424', '#101010'],
  ['#2B1F3A', '#120E1B'],
  ['#1F2E3A', '#0D141B'],
];

function gradientForId(id: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return THUMBNAIL_GRADIENTS[hash % THUMBNAIL_GRADIENTS.length];
}

export function mapApiCamera(c: ApiCamera, favorited: boolean): Camera {
  return {
    id: c.id,
    name: c.name,
    location: c.location ?? '',
    status: c.status === 'ONLINE' ? 'online' : 'offline',
    rawStatus: c.status,
    deviceId: c.device_id,
    motionSensitivity: c.motion_sensitivity,
    // No persistent "recording" concept in this API — true only while a
    // viewer has an active session, which LiveViewScreen tracks locally.
    recording: false,
    motionRecent: false,
    lastMotionText: 'No recent motion',
    favorited,
    // The API has no PTZ control endpoint at all yet.
    supportsPtz: false,
    thumbnailGradient: gradientForId(c.id),
  };
}

const EVENT_TYPE_MAP: Record<ApiEventType, EventType> = {
  MOTION_DETECTED: 'motion',
  CAMERA_ONLINE: 'cameraOnline',
  CAMERA_OFFLINE: 'cameraOffline',
};

/**
 * The API doesn't return a severity — it's derived client-side so the UI's
 * severity coloring/filtering still has something meaningful to show.
 */
function deriveSeverity(type: ApiEventType, confidence: number | null): EventSeverity {
  if (type === 'CAMERA_OFFLINE') return 'critical';
  if (type === 'CAMERA_ONLINE') return 'info';
  if (confidence === null) return 'low';
  if (confidence >= 90) return 'high';
  if (confidence >= 70) return 'medium';
  return 'low';
}

export function mapApiEvent(e: ApiEvent): SecurityEvent {
  return {
    id: e.id,
    type: EVENT_TYPE_MAP[e.type] ?? 'motion',
    severity: deriveSeverity(e.type, e.confidence),
    cameraId: e.camera_id,
    cameraName: e.camera_name ?? '',
    occurredAt: e.timestamp,
    durationSeconds: null,
    confidence: e.confidence,
    // No review/acknowledge concept on the API — tracked locally only.
    reviewed: false,
  };
}

export function mapApiNotification(n: ApiNotification): NotificationItem {
  return {
    id: n.id,
    type: EVENT_TYPE_MAP[n.type] ?? 'motion',
    title: n.title,
    occurredAt: n.created_at,
    read: n.read_at !== null,
  };
}
