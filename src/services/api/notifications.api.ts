import { apiRequest } from './httpClient';
import { mapApiNotification } from './mappers';
import type { ApiNotification } from './types';
import type { NotificationItem } from '@/types/domain';

export type NotificationListParams = {
  unread?: boolean;
  limit?: number;
  offset?: number;
};

function toQueryString(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return '';
  const search = new URLSearchParams(entries.map(([k, v]) => [k, String(v)]));
  return `?${search.toString()}`;
}

export async function listNotifications(
  params: NotificationListParams = {},
): Promise<NotificationItem[]> {
  const res = await apiRequest<{ notifications: ApiNotification[] }>(
    `/api/v1/notifications${toQueryString({ ...params, unread: params.unread ? 'true' : undefined })}`,
  );
  return res.notifications.map(mapApiNotification);
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiRequest(`/api/v1/notifications/${id}/read`, { method: 'PATCH' });
}

export type PushPlatform = 'ios' | 'android' | 'web';

export async function registerPushToken(platform: PushPlatform, token: string): Promise<void> {
  await apiRequest('/api/v1/notifications/push-tokens', {
    method: 'POST',
    body: { platform, token },
  });
}

export async function deletePushToken(platform: PushPlatform, token: string): Promise<void> {
  await apiRequest('/api/v1/notifications/push-tokens', {
    method: 'DELETE',
    body: { platform, token },
  });
}
