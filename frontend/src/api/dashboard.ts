import client from './client';
import type { ApiResponse, DashboardData, Feedback } from '../types';

export const getDashboard = async () => {
  const response = await client.get<ApiResponse<DashboardData>>('/dashboard');
  return response.data;
};

export const submitFeedback = async (data: { section: string; contentId: string; vote: 'up' | 'down' }) => {
  const response = await client.post<ApiResponse<Feedback>>('/feedback', data);
  return response.data;
};

export const getUserFeedback = async () => {
  const response = await client.get<ApiResponse<Feedback[]>>('/feedback');
  return response.data;
};
