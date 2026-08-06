import { apiClient } from './client';

export interface UserSessionDto {
  id: string;
  ipAddress: string;
  userAgent: string;
  deviceType?: string;
  createdAt: string;
  lastActiveAt: string;
  isCurrentSession: boolean;
}

export const sessionApi = {
  getActiveSessions: async (): Promise<UserSessionDto[]> => {
    const response = await apiClient.get<UserSessionDto[]>('/api/v1/auth/sessions');
    return response.data;
  },

  revokeSession: async (sessionId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/auth/sessions/${sessionId}`);
  },

  logoutAllSessions: async (): Promise<void> => {
    await apiClient.post('/api/v1/auth/logout-all');
  },
};
