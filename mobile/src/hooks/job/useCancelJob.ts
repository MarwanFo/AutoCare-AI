import { useMutation } from '@tanstack/react-query';
import { jobApi } from '@/api/jobApi';

export function useCancelJob() {
  return useMutation({
    mutationFn: (jobId: string) => jobApi.cancelJob(jobId),
  });
}
