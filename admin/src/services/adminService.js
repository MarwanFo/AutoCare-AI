import client from '../api/client';

export const adminService = {
  getStats: async () => {
    const response = await client.get('/admin/stats');
    return response.data;
  },

  getUsers: async (params = {}) => {
    const response = await client.get('/admin/users', { params });
    return response.data;
  },

  getUserById: async (id) => {
    const response = await client.get(`/admin/users/${id}`);
    return response.data;
  },

  updateUserStatus: async (id, status) => {
    const response = await client.patch(`/admin/users/${id}/status`, { status });
    return response.data;
  },

  updateUserRole: async (id, roleName) => {
    const response = await client.patch(`/admin/users/${id}/role`, { roleName });
    return response.data;
  },

  getJobs: async (params = {}) => {
    const response = await client.get('/admin/jobs', { params });
    return response.data;
  },

  getVehicles: async (params = {}) => {
    const response = await client.get('/admin/vehicles', { params });
    return response.data;
  },
};
