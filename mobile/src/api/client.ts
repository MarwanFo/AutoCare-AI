import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ENV } from '@/config/env';
import { useAuthStore } from '@/stores/authStore';
import { secureStore } from '@/storage/secureStore';

// Create a queue for requests that failed with 401 while refreshing
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (token) {
      promise.resolve(token);
    } else {
      promise.reject(error);
    }
  });
  failedQueue = [];
};

export const apiClient = axios.create({
  baseURL: ENV.API_URL,
  timeout: ENV.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If it is a 401 error and we haven't retried yet
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Avoid infinite loop if refreshing fails
      if (originalRequest.url?.includes('/auth/mobile/refresh') || originalRequest.url?.includes('/auth/mobile/login')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(apiClient(originalRequest));
            },
            reject: (err: any) => reject(err),
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const storedRefreshToken = await secureStore.getItem('refresh_token');
        if (!storedRefreshToken) {
          throw new Error('No refresh token stored');
        }

        // Perform token rotation call
        const response = await axios.post(`${ENV.API_URL}/api/v1/auth/mobile/refresh`, {
          refreshToken: storedRefreshToken,
        }, {
          headers: { 'Content-Type': 'application/json' },
        });

        const { accessToken, refreshToken, user } = response.data;

        // Persist rotated tokens
        await secureStore.setItem('access_token', accessToken);
        await secureStore.setItem('refresh_token', refreshToken);

        // Update Zustand Store
        useAuthStore.getState().setSession(accessToken, user || useAuthStore.getState().user);

        processQueue(null, accessToken);
        isRefreshing = false;

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        // Session is dead. Force logout on client side
        await secureStore.deleteItem('access_token');
        await secureStore.deleteItem('refresh_token');
        useAuthStore.getState().clearSession();

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
