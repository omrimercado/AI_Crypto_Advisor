import client from './client';
import type { ApiResponse, User, UserPreferences } from '../types';

export const getProfile = async () => {
  const response = await client.get<ApiResponse<User>>('/user/profile');
  return response.data;
};

export const saveOnboarding = async (preferences: UserPreferences) => {
  const response = await client.post<ApiResponse<User>>('/user/onboarding', { preferences });
  return response.data;
};
