import { create } from 'zustand';
import { NotificationItem } from '@/types/domain';
import { mockNotifications } from '@/services/mock/notifications.mock';

type NotificationStore = {
  notifications: NotificationItem[];
  toggleRead: (id: string) => void;
  remove: (id: string) => void;
  markAllRead: () => void;
};

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: mockNotifications,
  toggleRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: !n.read } : n)),
    })),
  remove: (id) =>
    set((state) => ({ notifications: state.notifications.filter((n) => n.id !== id) })),
  markAllRead: () =>
    set((state) => ({ notifications: state.notifications.map((n) => ({ ...n, read: true })) })),
}));
