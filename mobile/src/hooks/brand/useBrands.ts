import { useQuery } from '@tanstack/react-query';
import { brandApi } from '@/api/brandApi';
import { QUERY_KEYS } from '@/constants/queryKeys';

export function useBrands() {
  return useQuery({
    queryKey: QUERY_KEYS.BRANDS,
    queryFn: brandApi.getAllBrands,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours stale time
    gcTime: 48 * 60 * 60 * 1000, // Keep in garbage collection for 48 hours
  });
}
