import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vehicleApi } from '@/api/vehicleApi';
import { UpdateVehicleRequest } from '@/types/vehicle';
import { QUERY_KEYS } from '@/constants/queryKeys';

interface UpdateVehicleVariables {
  id: string;
  request: UpdateVehicleRequest;
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: UpdateVehicleVariables) =>
      vehicleApi.updateVehicle(id, request),
    onSuccess: (data, variables) => {
      // Invalidate the detail query for this specific vehicle
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.VEHICLE(variables.id),
      });
      // Invalidate list queries
      queryClient.invalidateQueries({
        queryKey: ['vehicles'],
      });
    },
  });
}
