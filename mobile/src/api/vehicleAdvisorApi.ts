import { apiClient } from './client';

export interface AiAdvisorResponse {
  vehicleContext: string;
  question: string;
  answer: string;
}

export interface VehicleReportResponse {
  vehicleId: string;
  vehicleTitle: string;
  nickname?: string;
  vin?: string;
  licensePlate?: string;
  currentMileage: number;
  mileageUnit: string;
  fuelType: string;
  transmission: string;
  completenessScore: number;
  overallHealthScore: number;
  generatedAt: string;
  components: Array<{
    name: string;
    category: string;
    healthScore: number;
    status: string;
    remainingMileage?: number;
    remainingDays?: number;
    lastReplacedDate?: string;
  }>;
  criticalWarnings: string[];
}

export const vehicleAdvisorApi = {
  askAdvisor: async (vehicleId: string, question: string): Promise<AiAdvisorResponse> => {
    const response = await apiClient.post<AiAdvisorResponse>(
      `/api/v1/vehicles/${vehicleId}/ai-advisor`,
      { question }
    );
    return response.data;
  },

  getHealthReport: async (vehicleId: string): Promise<VehicleReportResponse> => {
    const response = await apiClient.get<VehicleReportResponse>(
      `/api/v1/vehicles/${vehicleId}/export-report`
    );
    return response.data;
  },
};
