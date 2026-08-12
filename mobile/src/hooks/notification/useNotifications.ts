import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';

export type NotificationType =
  | 'COMPONENT_CRITICAL'
  | 'COMPONENT_WARNING'
  | 'COMPONENT_DATA_REQUIRED'
  | 'DOCUMENT_EXPIRING'
  | 'DOCUMENT_EXPIRED';

export interface NotificationItem {
  id: string;
  type?: NotificationType;
  severity: 'DANGER' | 'WARNING' | 'INFO';
  vehicleId?: string;
  vehicleTitle?: string;
  componentId?: string;
  componentCode?: string;
  healthScore?: number;
  documentId?: string;
  documentTitle?: string;
  expiryDate?: string;
  isRead: boolean;
  resolvedAt?: string;
  isResolved?: boolean;
  createdAt: string;
  title: string;
  message: string;
}

export function useNotifications() {
  return useQuery<NotificationItem[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/notifications');
      return response.data.content || response.data;
    },
    refetchInterval: 15000,
  });
}

export function useUnreadNotificationCount() {
  return useQuery<number>({
    queryKey: ['notifications', 'unreadCount'],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/notifications/unread-count');
      return response.data.unreadCount;
    },
    refetchInterval: 15000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(`/api/v1/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiClient.patch('/api/v1/notifications/read-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
