import { create } from 'zustand';
import { NotificationItem } from '@/types/domain';
import * as notificationsApi from '@/services/api/notifications.api';
import type { NotificationListParams } from '@/services/api/notifications.api';
import { ApiError } from '@/services/api/ApiError';

type LoadStatus = 'idle' | 'loading' | 'error';

type NotificationStore = {
  notifications: NotificationItem[];
  status: LoadStatus;
  error: string | null;
  fetchNotifications: (params?: NotificationListParams) => Promise<void>;
  /** Marks read via `PATCH .../read` when going unread -> read. The API has
   * no way to mark something unread again, so going the other direction is
   * local-only UI state that a refetch will overwrite. */
  toggleRead: (id: string) => void;
  /** No delete endpoint on the API — local dismissal only; a refetch brings it back. */
  remove: (id: string) => void;
  markAllRead: () => void;
  reset: () => void;
};

function errorMessage(err: unknown): string {
  return err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  status: 'idle',
  error: null,

  fetchNotifications: async (params) => {
    set({ status: 'loading', error: null });
    try {
      const notifications = await notificationsApi.listNotifications(params);
      set({ notifications, status: 'idle' });
    } catch (err) {
      set({ status: 'error', error: errorMessage(err) });
    }
  },

  toggleRead: (id) => {
    const target = get().notifications.find((n) => n.id === id);
    if (!target) return;
    const nextRead = !target.read;
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: nextRead } : n)),
    }));
    if (nextRead) {
      notificationsApi.markNotificationRead(id).catch(() => {
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: false } : n)),
        }));
      });
    }
  },

  remove: (id) =>
    set((state) => ({ notifications: state.notifications.filter((n) => n.id !== id) })),

  markAllRead: () => {
    const unreadIds = get()
      .notifications.filter((n) => !n.read)
      .map((n) => n.id);
    set((state) => ({ notifications: state.notifications.map((n) => ({ ...n, read: true })) }));
    unreadIds.forEach((id) => {
      notificationsApi.markNotificationRead(id).catch(() => {});
    });
  },

  reset: () => set({ notifications: [], status: 'idle', error: null }),
}));
