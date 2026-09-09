import { apiRequest } from './httpClient';
import { mapApiEvent } from './mappers';
import type { ApiEvent } from './types';
import type { SecurityEvent } from '@/types/domain';
import type { EventListParams } from './cameras.api';

function toQueryString(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return '';
  const search = new URLSearchParams(entries.map(([k, v]) => [k, String(v)]));
  return `?${search.toString()}`;
}

export async function listEvents(params: EventListParams = {}): Promise<SecurityEvent[]> {
  const res = await apiRequest<{ events: ApiEvent[] }>(`/api/v1/events${toQueryString(params)}`);
  return res.events.map(mapApiEvent);
}

export async function getEvent(id: string): Promise<SecurityEvent> {
  const event = await apiRequest<ApiEvent>(`/api/v1/events/${id}`);
  return mapApiEvent(event);
}
