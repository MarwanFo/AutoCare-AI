import { useQuery } from '@tanstack/react-query';
import { vehicleApi } from '@/api/vehicleApi';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { VehicleStatus } from '@/types/vehicle';

interface UseVehiclesParams {
  status?: VehicleStatus;
  page?: number;
  size?: number;
  sort?: string;
}

export function useVehicles({
  status = 'ACTIVE',
  page = 0,
  size = 10,
  sort = 'created_at,desc',
}: UseVehiclesParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.VEHICLES(status, page, size),
    queryFn: () => vehicleApi.getVehicles(status, page, size, sort),
  });
}
