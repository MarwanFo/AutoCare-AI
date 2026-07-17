import { apiClient } from './client';
import { ENDPOINTS } from '@/constants/endpoints';
import { Page } from '@/types/common';
import {
  CreateVehicleRequest,
  UpdateVehicleRequest,
  VehicleResponse,
  VehicleSummaryResponse,
  VehicleStatus,
} from '@/types/vehicle';
import { JobResponse } from '@/types/job';

export const vehicleApi = {
  createVehicle: async (request: CreateVehicleRequest, clientRequestId?: string): Promise<JobResponse> => {
    const headers = clientRequestId ? { 'X-Client-Request-Id': clientRequestId } : {};
    const response = await apiClient.post<JobResponse>(ENDPOINTS.VEHICLES.BASE, request, { headers });
    return response.data;
  },

  getVehicles: async (
    status: VehicleStatus = 'ACTIVE',
    page = 0,
    size = 10,
    sort = 'created_at,desc'
  ): Promise<Page<VehicleSummaryResponse>> => {
    const response = await apiClient.get<Page<VehicleSummaryResponse>>(ENDPOINTS.VEHICLES.BASE, {
      params: {
        status,
        page,
        size,
        sort,
      },
    });
    return response.data;
  },

  getVehicleById: async (id: string): Promise<VehicleResponse> => {
    const response = await apiClient.get<VehicleResponse>(ENDPOINTS.VEHICLES.DETAIL(id));
    return response.data;
  },

  updateVehicle: async (id: string, request: UpdateVehicleRequest): Promise<VehicleResponse> => {
    const response = await apiClient.put<VehicleResponse>(ENDPOINTS.VEHICLES.DETAIL(id), request);
    return response.data;
  },

  archiveVehicle: async (id: string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.VEHICLES.DETAIL(id));
  },

  setPrimaryVehicle: async (id: string): Promise<VehicleResponse> => {
    const response = await apiClient.patch<VehicleResponse>(ENDPOINTS.VEHICLES.PRIMARY(id));
    return response.data;
  },
};
