import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/api/userApi';
import { QUERY_KEYS } from '@/constants/queryKeys';

export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.updatePreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_PROFILE });
    },
  });
}
