import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/api/userApi';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { useAuthStore } from '@/stores/authStore';

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation({
    mutationFn: userApi.uploadAvatar,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_PROFILE });
      updateUser({
        avatarUrl: data.avatarUrl,
      });
    },
  });
}
