import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vehicleApi } from '@/api/vehicleApi';
import { Page } from '@/types/common';
import { VehicleSummaryResponse } from '@/types/vehicle';

export function useDeleteVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => vehicleApi.archiveVehicle(id),
    
    // Perform optimistic updates by removing/modifying the vehicle in list cache
    onMutate: async (deletedId) => {
      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['vehicles'] });

      // Snapshot the previous values
      const previousVehiclesQueries = queryClient.getQueriesData<Page<VehicleSummaryResponse>>({
        queryKey: ['vehicles'],
      });

      // Optimistically update all vehicles lists (e.g. active list)
      queryClient.setQueriesData<Page<VehicleSummaryResponse>>(
        { queryKey: ['vehicles'] },
        (oldPage) => {
          if (!oldPage) return oldPage;
          return {
            ...oldPage,
            content: oldPage.content.filter((vehicle) => vehicle.id !== deletedId),
            totalElements: Math.max(0, oldPage.totalElements - 1),
          };
        }
      );

      // Return a context object with the snapshotted values
      return { previousVehiclesQueries };
    },

    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, deletedId, context) => {
      if (context?.previousVehiclesQueries) {
        context.previousVehiclesQueries.forEach(([key, value]) => {
          queryClient.setQueryData(key, value);
        });
      }
    },

    // Always refetch or invalidate after success or error
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle', variables] });
    },
  });
}
