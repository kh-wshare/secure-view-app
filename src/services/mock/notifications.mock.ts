import { NotificationItem } from '@/types/domain';

const now = Date.now();
const minutesAgo = (m: number) => new Date(now - m * 60_000).toISOString();

export const mockNotifications: NotificationItem[] = [
  {
    id: 'n1',
    type: 'person',
    title: 'Person detected at Front Door',
    occurredAt: minutesAgo(38),
    read: false,
  },
  {
    id: 'n2',
    type: 'cameraOffline',
    title: 'Garage camera is offline',
    occurredAt: minutesAgo(210),
    read: false,
  },
  {
    id: 'n3',
    type: 'motion',
    title: 'Motion detected in Backyard',
    occurredAt: minutesAgo(340),
    read: true,
  },
  {
    id: 'n4',
    type: 'cameraOnline',
    title: 'Camera connection restored',
    occurredAt: minutesAgo(365),
    read: true,
  },
  {
    id: 'n5',
    type: 'motion',
    title: 'Motion detected at Living Room',
    occurredAt: minutesAgo(1420),
    read: true,
  },
  {
    id: 'n6',
    type: 'person',
    title: 'Person detected at Front Door',
    occurredAt: minutesAgo(1585),
    read: true,
  },
];
