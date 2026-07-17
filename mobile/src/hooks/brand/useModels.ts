import { useQuery } from '@tanstack/react-query';
import { modelApi } from '@/api/modelApi';
import { QUERY_KEYS } from '@/constants/queryKeys';

export function useModels(brandId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.MODELS(brandId || ''),
    queryFn: () => modelApi.getModelsByBrand(brandId!),
    enabled: !!brandId, // Only fetch if brandId is defined
    staleTime: 24 * 60 * 60 * 1000, // 24 hours stale time
    gcTime: 48 * 60 * 60 * 1000,
  });
}
