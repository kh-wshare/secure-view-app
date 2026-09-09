import { apiRequest } from './httpClient';
import { mapApiCamera, mapApiEvent } from './mappers';
import type { ApiCamera, ApiEvent, ApiProvisioningToken, ApiStreamSession } from './types';
import type { Camera, SecurityEvent } from '@/types/domain';

export type CreateCameraInput = {
  name: string;
  location?: string;
  deviceId?: string;
  provisioningToken?: string;
  rtsp: {
    host: string;
    path?: string;
    username?: string;
    password?: string;
  };
};

export type UpdateCameraInput = Partial<{
  name: string;
  location: string;
  motionSensitivity: number;
  enabled: boolean;
}>;

export type EventListParams = {
  type?: 'MOTION_DETECTED' | 'CAMERA_ONLINE' | 'CAMERA_OFFLINE';
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
};

function toQueryString(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return '';
  const search = new URLSearchParams(entries.map(([k, v]) => [k, String(v)]));
  return `?${search.toString()}`;
}

export async function createProvisioningToken(): Promise<ApiProvisioningToken> {
  return apiRequest<ApiProvisioningToken>('/api/v1/cameras/provisioning-token', { method: 'POST' });
}

export async function createCamera(
  input: CreateCameraInput,
  favorited: (id: string) => boolean,
): Promise<Camera> {
  const camera = await apiRequest<ApiCamera>('/api/v1/cameras', {
    method: 'POST',
    body: {
      name: input.name,
      location: input.location,
      device_id: input.deviceId,
      provisioning_token: input.provisioningToken,
      rtsp: input.rtsp,
    },
  });
  return mapApiCamera(camera, favorited(camera.id));
}

export async function listCameras(favorited: (id: string) => boolean): Promise<Camera[]> {
  const res = await apiRequest<{ cameras: ApiCamera[] }>('/api/v1/cameras');
  return res.cameras.map((c) => mapApiCamera(c, favorited(c.id)));
}

export async function getCamera(id: string, favorited: (id: string) => boolean): Promise<Camera> {
  const camera = await apiRequest<ApiCamera>(`/api/v1/cameras/${id}`);
  return mapApiCamera(camera, favorited(camera.id));
}

export async function updateCamera(
  id: string,
  patch: UpdateCameraInput,
  favorited: (id: string) => boolean,
): Promise<Camera> {
  const camera = await apiRequest<ApiCamera>(`/api/v1/cameras/${id}`, {
    method: 'PATCH',
    body: {
      name: patch.name,
      location: patch.location,
      motion_sensitivity: patch.motionSensitivity,
      enabled: patch.enabled,
    },
  });
  return mapApiCamera(camera, favorited(camera.id));
}

export async function deleteCamera(id: string): Promise<void> {
  await apiRequest(`/api/v1/cameras/${id}`, { method: 'DELETE' });
}

export async function connectCamera(id: string): Promise<void> {
  await apiRequest(`/api/v1/cameras/${id}/connect`, { method: 'POST' });
}

export async function disconnectCamera(id: string): Promise<void> {
  await apiRequest(`/api/v1/cameras/${id}/disconnect`, { method: 'POST' });
}

export async function startStream(id: string): Promise<ApiStreamSession> {
  return apiRequest<ApiStreamSession>(`/api/v1/cameras/${id}/stream`, { method: 'POST' });
}

export async function stopStream(id: string): Promise<void> {
  await apiRequest(`/api/v1/cameras/${id}/stream`, { method: 'DELETE' });
}

export async function listCameraEvents(
  cameraId: string,
  params: EventListParams = {},
): Promise<SecurityEvent[]> {
  const res = await apiRequest<{ events: ApiEvent[] }>(
    `/api/v1/cameras/${cameraId}/events${toQueryString(params)}`,
  );
  return res.events.map(mapApiEvent);
}
