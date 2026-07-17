import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vehicleApi } from '@/api/vehicleApi';
import { CreateVehicleRequest } from '@/types/vehicle';

export function useCreateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ request, clientRequestId }: { request: CreateVehicleRequest; clientRequestId?: string }) =>
      vehicleApi.createVehicle(request, clientRequestId),
    onSuccess: () => {
      // Invalidate all queries matching 'vehicles' prefix
      queryClient.invalidateQueries({
        queryKey: ['vehicles'],
      });
    },
  });
}
