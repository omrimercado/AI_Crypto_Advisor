import client from './client';
import type { ApiResponse, AuthResponse } from '../types';

export const register = async (data: { email: string; name: string; password: string }) => {
  const response = await client.post<ApiResponse<AuthResponse>>('/auth/register', data);
  return response.data;
};

export const login = async (data: { email: string; password: string }) => {
  const response = await client.post<ApiResponse<AuthResponse>>('/auth/login', data);
  return response.data;
};
