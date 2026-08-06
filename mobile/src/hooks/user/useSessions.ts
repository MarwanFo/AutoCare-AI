import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sessionApi, UserSessionDto } from '@/api/sessionApi';

export const SESSIONS_QUERY_KEY = ['user-sessions'] as const;

export function useSessions() {
  return useQuery<UserSessionDto[]>({
    queryKey: SESSIONS_QUERY_KEY,
    queryFn: () => sessionApi.getActiveSessions(),
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => sessionApi.revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY });
    },
  });
}

export function useLogoutAllSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => sessionApi.logoutAllSessions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY });
    },
  });
}
