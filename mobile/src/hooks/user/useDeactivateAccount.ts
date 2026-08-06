import { useMutation } from '@tanstack/react-query';
import { userApi } from '@/api/userApi';
import { useAuthStore } from '@/stores/authStore';
import { secureStore } from '@/storage/secureStore';

export function useDeactivateAccount() {
  const clearSession = useAuthStore((state) => state.clearSession);

  return useMutation({
    mutationFn: userApi.deactivateAccount,
    onSuccess: async () => {
      await secureStore.deleteItem('access_token');
      await secureStore.deleteItem('refresh_token');
      clearSession();
    },
  });
}
