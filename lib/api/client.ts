import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { storage } from '../utils';
import type { ApiError } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - add JWT token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.get<string>('token', '');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    // Handle 401 - Unauthorized (token expired)
    if (error.response?.status === 401) {
      storage.remove('token');
      storage.remove('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    // Extract error message
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';

    return Promise.reject({
      message,
      errors: error.response?.data?.errors,
      status: error.response?.status,
    });
  }
);

export default apiClient;
