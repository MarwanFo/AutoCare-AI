import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { PricingPack, PackType, UserMembershipStatus } from '@/types/pack';

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

export const useUserMembershipStatus = () => {
  return useQuery<UserMembershipStatus>({
    queryKey: ['myMembershipStatus'],
    queryFn: async () => {
      const response = await apiClient.get<UserMembershipStatus>('/api/v1/packs/my-status');
      return response.data;
    },
    staleTime: 1000 * 30, // 30 seconds
  });
};

export const useActivatePack = () => {
  const queryClient = useQueryClient();

  return useMutation<UserMembershipStatus, Error, string>({
    mutationFn: async (packId: string) => {
      const response = await apiClient.post<UserMembershipStatus>(`/api/v1/packs/activate/${packId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myMembershipStatus'] });
      queryClient.invalidateQueries({ queryKey: ['activePacks'] });
    },
  });
};
