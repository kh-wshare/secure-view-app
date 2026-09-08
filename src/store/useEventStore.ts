import { create } from 'zustand';
import { SecurityEvent } from '@/types/domain';
import { mockEvents } from '@/services/mock/events.mock';

type EventStore = {
  events: SecurityEvent[];
  markReviewed: (id: string, reviewed: boolean) => void;
  getById: (id: string) => SecurityEvent | undefined;
};

export const useEventStore = create<EventStore>((set, get) => ({
  events: mockEvents,
  markReviewed: (id, reviewed) =>
    set((state) => ({
      events: state.events.map((e) => (e.id === id ? { ...e, reviewed } : e)),
    })),
  getById: (id) => get().events.find((e) => e.id === id),
}));
