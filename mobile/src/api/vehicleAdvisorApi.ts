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

export interface VehicleBudgetItem {
  componentName: string;
  category: string;
  healthScore: number;
  urgency: 'URGENT' | 'UPCOMING' | 'SCHEDULED';
  estimatedPartCost: number;
  estimatedLaborCost: number;
  totalCost: number;
  timeframe: '0-3M' | '3-6M' | '6-12M';
  aiRecommendation: string;
}

export interface VehicleBudgetForecastResponse {
  vehicleId: string;
  vehicleTitle: string;
  brandTier: 'ECONOMY' | 'STANDARD' | 'PREMIUM' | 'LUXURY' | 'EXOTIC';
  currency: string;
  totalEstimatedBudget: number;
  budget0To3Months: number;
  budget3To6Months: number;
  budget6To12Months: number;
  estimatedLaborRatePerHour: number;
  totalLaborHours: number;
  aiSummary: string;
  items: VehicleBudgetItem[];
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

  getBudgetForecast: async (vehicleId: string, currency: string = 'EUR'): Promise<VehicleBudgetForecastResponse> => {
    const response = await apiClient.get<VehicleBudgetForecastResponse>(
      `/api/v1/vehicles/${vehicleId}/budget-forecast`,
      { params: { currency } }
    );
    return response.data;
  },
};

