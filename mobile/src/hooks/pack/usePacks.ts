import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { PricingPack, PackType } from '@/types/pack';

export const useActivePacks = (packType?: PackType) => {
  return useQuery<PricingPack[]>({
    queryKey: ['activePacks', packType],
    queryFn: async () => {
      const response = await apiClient.get<PricingPack[]>('/api/v1/packs/active', {
        params: packType ? { type: packType } : undefined,
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
};
