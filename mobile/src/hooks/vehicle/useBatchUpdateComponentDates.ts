import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vehicleApi } from '@/api/vehicleApi';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { VehicleResponse } from '@/types/vehicle';

export function useBatchUpdateComponentDates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      vehicleId,
      componentDates,
    }: {
      vehicleId: string;
      componentDates: Record<string, string>;
    }) => vehicleApi.batchUpdateComponentDates(vehicleId, componentDates),
    onSuccess: (data: VehicleResponse) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.setQueryData(QUERY_KEYS.VEHICLE(data.id), data);
    },
  });
}
