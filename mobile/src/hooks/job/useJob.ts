import { useQuery } from '@tanstack/react-query';
import { jobApi } from '@/api/jobApi';
import { AppState, AppStateStatus } from 'react-native';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';

export function useJob(jobId: string | null) {
  const [appActive, setAppActive] = useState(true);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      setAppActive(nextAppState === 'active');
    });
    return () => subscription.remove();
  }, []);

  return useQuery({
    queryKey: ['job', jobId],
    queryFn: () => {
      if (!jobId) throw new Error('No jobId provided');
      return jobApi.getJobById(jobId);
    },
    enabled: !!jobId && appActive && isAuthenticated,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 1500;
      if (data.status === 'COMPLETED' || data.status === 'FAILED' || data.status === 'CANCELLED') {
        return false;
      }
      return 1500;
    },
    refetchOnWindowFocus: true,
  });
}
