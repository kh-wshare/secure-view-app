import { SharedUser } from '@/types/domain';

export const mockSharedUsers: SharedUser[] = [
  {
    id: 'u1',
    name: 'Maya Chen',
    initials: 'MC',
    accessSummary: 'Full access',
    avatarTint: '#4C8DFF',
  },
  {
    id: 'u2',
    name: 'Sam Rivera',
    initials: 'SR',
    accessSummary: 'View + alerts only',
    avatarTint: '#FFB020',
  },
];
