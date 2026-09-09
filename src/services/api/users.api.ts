import { apiRequest } from './httpClient';
import { mapApiUser } from './mappers';
import type { ApiUser } from './types';
import type { User } from '@/types/domain';

export async function getMe(): Promise<User> {
  const user = await apiRequest<ApiUser>('/api/v1/users/me');
  return mapApiUser(user);
}
