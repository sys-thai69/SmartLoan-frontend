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

// Request interceptor - add Firebase ID token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // First try to get token from storage (set by AuthContext when Firebase auth state changes)
    const token = storage.get<string>('token', '');

    // If token exists, add it to headers
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
    // Handle 401 - Unauthorized (token expired or invalid)
    if (error.response?.status === 401) {
      // Clear stored credentials
      storage.remove('token');
      storage.remove('user');

      // Redirect to login (Firebase will handle the actual sign-out)
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    // Extract error message with better formatting
    let message = 'An unexpected error occurred';

    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.message === 'Network Error') {
      message = 'Network error. Please check your connection and try again.';
    } else if (error.code === 'ECONNABORTED') {
      message = 'Request timeout. The server took too long to respond.';
    } else if (error.response?.status === 404) {
      message = 'Resource not found.';
    } else if (error.response?.status === 500) {
      message = 'Server error. Please try again later.';
    } else if (error.response?.status === 503) {
      message = 'Service temporarily unavailable. Please try again later.';
    } else if (error.message) {
      message = error.message;
    }

    return Promise.reject({
      message,
      errors: error.response?.data?.errors,
      status: error.response?.status,
      originalError: error,
    });
  }
);

export default apiClient;
