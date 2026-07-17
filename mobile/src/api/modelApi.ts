import { apiClient } from './client';
import { ENDPOINTS } from '@/constants/endpoints';
import { ModelResponse } from '@/types/model';

export const modelApi = {
  getModelsByBrand: async (brandId: string): Promise<ModelResponse[]> => {
    const response = await apiClient.get<ModelResponse[]>(ENDPOINTS.BRANDS.MODELS(brandId));
    return response.data;
  },
};
