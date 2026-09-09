/**
 * Raw wire shapes returned by the Go control plane, as documented in prose by
 * the project's Postman collection (`security-camera.postman_collection.json`).
 * The collection ships no example response bodies, so field names below are
 * inferred from its endpoint descriptions rather than copied from backend
 * source (the Go/Rust services live in a separate repo, not this one).
 * If a field name doesn't match what the real API sends, this is the one
 * file to fix — every screen consumes the mapped domain types in
 * `@/types/domain`, never these DTOs directly.
 */

export type ApiUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type ApiAuthResponse = {
  access_token: string;
  access_expires_at: string;
  refresh_token: string;
  refresh_expires_at: string;
  user: ApiUser;
};

export type ApiCameraStatus = 'PROVISIONING' | 'ONLINE' | 'OFFLINE' | 'DISABLED';

export type ApiCamera = {
  id: string;
  name: string;
  location: string;
  status: ApiCameraStatus;
  device_id: string | null;
  motion_sensitivity: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type ApiProvisioningToken = {
  device_id: string;
  provisioning_token: string;
  expires_at: string;
  qr_payload: string;
};

export type ApiStreamSession = {
  session_id: string;
  stream_token: string;
  expires_at: string;
  webrtc_url: string;
  ice_servers: RTCIceServerLike[];
};

export type RTCIceServerLike = {
  urls: string | string[];
  username?: string;
  credential?: string;
};

export type ApiEventType = 'MOTION_DETECTED' | 'CAMERA_ONLINE' | 'CAMERA_OFFLINE';

export type ApiEvent = {
  id: string;
  camera_id: string;
  camera_name: string;
  type: ApiEventType;
  timestamp: string;
  confidence: number | null;
  metadata: Record<string, unknown> | null;
};

export type ApiNotification = {
  id: string;
  type: ApiEventType;
  title: string;
  created_at: string;
  read_at: string | null;
};
