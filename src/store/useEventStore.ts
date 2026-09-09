import { create } from 'zustand';
import { SecurityEvent } from '@/types/domain';
import * as eventsApi from '@/services/api/events.api';
import * as camerasApi from '@/services/api/cameras.api';
import type { EventListParams } from '@/services/api/cameras.api';
import { ApiError } from '@/services/api/ApiError';
import { formatRelativeMinutes } from '@/utils/format';
import { useCameraStore } from './useCameraStore';

type LoadStatus = 'idle' | 'loading' | 'error';

type EventStore = {
  events: SecurityEvent[];
  status: LoadStatus;
  error: string | null;
  fetchEvents: (params?: EventListParams) => Promise<void>;
  fetchCameraEvents: (cameraId: string, params?: EventListParams) => Promise<void>;
  fetchEvent: (id: string) => Promise<void>;
  markReviewed: (id: string, reviewed: boolean) => void;
  getById: (id: string) => SecurityEvent | undefined;
  reset: () => void;
};

function errorMessage(err: unknown): string {
  return err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
}

/** Pushes each camera's most recent motion event into useCameraStore, since `lastMotionText` lives on the Camera object but the API only reports it via the events feed. */
function syncLastMotion(events: SecurityEvent[]) {
  const latestByCamera = new Map<string, SecurityEvent>();
  for (const event of events) {
    if (event.type !== 'motion') continue;
    const existing = latestByCamera.get(event.cameraId);
    if (!existing || event.occurredAt > existing.occurredAt) {
      latestByCamera.set(event.cameraId, event);
    }
  }
  const setLastMotion = useCameraStore.getState().setLastMotion;
  for (const [cameraId, event] of latestByCamera) {
    setLastMotion(cameraId, `Motion detected ${formatRelativeMinutes(event.occurredAt)}`, true);
  }
}

export const useEventStore = create<EventStore>((set, get) => ({
  events: [],
  status: 'idle',
  error: null,

  fetchEvents: async (params) => {
    set({ status: 'loading', error: null });
    try {
      const events = await eventsApi.listEvents(params);
      set({ events, status: 'idle' });
      syncLastMotion(events);
    } catch (err) {
      set({ status: 'error', error: errorMessage(err) });
    }
  },

  fetchCameraEvents: async (cameraId, params) => {
    try {
      const cameraEvents = await camerasApi.listCameraEvents(cameraId, params);
      set((state) => ({
        events: [...state.events.filter((e) => e.cameraId !== cameraId), ...cameraEvents],
      }));
      syncLastMotion(cameraEvents);
    } catch (err) {
      set({ error: errorMessage(err) });
    }
  },

  fetchEvent: async (id) => {
    try {
      const event = await eventsApi.getEvent(id);
      set((state) => ({
        events: state.events.some((e) => e.id === id)
          ? state.events.map((e) => (e.id === id ? event : e))
          : [...state.events, event],
      }));
    } catch (err) {
      set({ error: errorMessage(err) });
    }
  },

  // No review/acknowledge endpoint on the API — kept as local-only UI state.
  markReviewed: (id, reviewed) =>
    set((state) => ({
      events: state.events.map((e) => (e.id === id ? { ...e, reviewed } : e)),
    })),

  getById: (id) => get().events.find((e) => e.id === id),

  reset: () => set({ events: [], status: 'idle', error: null }),
}));
