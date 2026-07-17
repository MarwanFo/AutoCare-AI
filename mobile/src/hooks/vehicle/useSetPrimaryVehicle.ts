import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vehicleApi } from '@/api/vehicleApi';
import { Page } from '@/types/common';
import { VehicleSummaryResponse } from '@/types/vehicle';

export function useSetPrimaryVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => vehicleApi.setPrimaryVehicle(id),

    // Optimistically toggle isPrimary flags
    onMutate: async (targetId) => {
      await queryClient.cancelQueries({ queryKey: ['vehicles'] });

      // Snapshot the previous vehicles queries state
      const previousVehiclesQueries = queryClient.getQueriesData<Page<VehicleSummaryResponse>>({
        queryKey: ['vehicles'],
      });

      // Update cached lists to reflect the new primary vehicle immediately
      queryClient.setQueriesData<Page<VehicleSummaryResponse>>(
        { queryKey: ['vehicles'] },
        (oldPage) => {
          if (!oldPage) return oldPage;
          return {
            ...oldPage,
            content: oldPage.content.map((vehicle) => ({
              ...vehicle,
              isPrimary: vehicle.id === targetId,
            })),
          };
        }
      );

      return { previousVehiclesQueries };
    },

    // Roll back if error occurs
    onError: (err, targetId, context) => {
      if (context?.previousVehiclesQueries) {
        context.previousVehiclesQueries.forEach(([key, value]) => {
          queryClient.setQueryData(key, value);
        });
      }
    },

    // Always invalidate after success or error to sync state with server
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle', variables] });
    },
  });
}
