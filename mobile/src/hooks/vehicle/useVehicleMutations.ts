import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';

export interface CreateComponentPayload {
  name: string;
  category: string;
  partNumber?: string;
  specifications?: string;
  notes?: string;
}

export interface CreateDocumentPayload {
  title: string;
  url: string;
  notes?: string;
}

export interface CreateIntervalPayload {
  title: string;
  description?: string;
  intervalMileage?: number;
  intervalMonths?: number;
  isInspectionOnly?: boolean;
}

export function useAddComponent(vehicleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateComponentPayload) => {
      const response = await apiClient.post(`/api/v1/vehicles/${vehicleId}/components`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle', vehicleId] });
    },
  });
}

export function useDeleteComponent(vehicleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (componentId: string) => {
      await apiClient.delete(`/api/v1/vehicles/${vehicleId}/components/${componentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle', vehicleId] });
    },
  });
}

export function useAddDocument(vehicleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateDocumentPayload) => {
      const response = await apiClient.post(`/api/v1/vehicles/${vehicleId}/documents`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle', vehicleId] });
    },
  });
}

export function useDeleteDocument(vehicleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (documentId: string) => {
      await apiClient.delete(`/api/v1/vehicles/${vehicleId}/documents/${documentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle', vehicleId] });
    },
  });
}

export function useAddInterval(vehicleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateIntervalPayload) => {
      const response = await apiClient.post(`/api/v1/vehicles/${vehicleId}/intervals`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle', vehicleId] });
    },
  });
}

export function useDeleteInterval(vehicleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (intervalId: string) => {
      await apiClient.delete(`/api/v1/vehicles/${vehicleId}/intervals/${intervalId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle', vehicleId] });
    },
  });
}
