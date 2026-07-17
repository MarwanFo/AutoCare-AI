import { useQuery } from '@tanstack/react-query';
import { vehicleApi } from '@/api/vehicleApi';
import { QUERY_KEYS } from '@/constants/queryKeys';

export function useVehicle(id?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.VEHICLE(id || ''),
    queryFn: () => vehicleApi.getVehicleById(id!),
    enabled: !!id, // Only fetch if id is provided
  });
}
