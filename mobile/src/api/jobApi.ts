import { apiClient } from './client';
import { JobResponse } from '@/types/job';

export const jobApi = {
  getJobById: async (id: string): Promise<JobResponse> => {
    const response = await apiClient.get<JobResponse>(`/api/v1/jobs/${id}`);
    return response.data;
  },

  cancelJob: async (id: string): Promise<void> => {
    await apiClient.post(`/api/v1/jobs/${id}/cancel`);
  },
};
