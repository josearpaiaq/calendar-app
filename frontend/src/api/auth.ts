import type { LoginPayload, LoginResponse } from '../types/auth';
import api from './api';

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const { data } = await api.post<LoginResponse>('/auth/login', payload);

  if (!data.token) {
    throw new Error('Failed to login');
  }

  const token = localStorage.getItem('token');
  if (token) localStorage.removeItem('token');
  localStorage.setItem('token', data.token);

  return data;
};

export const logout = async (): Promise<void> => {
  localStorage.removeItem('token');
};