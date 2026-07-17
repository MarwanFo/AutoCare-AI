import { apiClient } from './client';
import { ENDPOINTS } from '@/constants/endpoints';
import { BrandResponse } from '@/types/brand';

export const brandApi = {
  getAllBrands: async (): Promise<BrandResponse[]> => {
    const response = await apiClient.get<BrandResponse[]>(ENDPOINTS.BRANDS.LIST);
    return response.data;
  },
};
