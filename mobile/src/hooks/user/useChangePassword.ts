import { useMutation } from '@tanstack/react-query';
import { userApi } from '@/api/userApi';

export function useChangePassword() {
  return useMutation({
    mutationFn: userApi.changePassword,
  });
}
