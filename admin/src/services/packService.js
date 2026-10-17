import client from '../api/client';

export const packService = {
  // Admin Endpoints
  getPacks: async (params = {}) => {
    const response = await client.get('/admin/packs', { params });
    return response.data;
  },

  getPackById: async (id) => {
    const response = await client.get(`/admin/packs/${id}`);
    return response.data;
  },

  createPack: async (packData) => {
    const response = await client.post('/admin/packs', packData);
    return response.data;
  },

  updatePack: async (id, packData) => {
    const response = await client.put(`/admin/packs/${id}`, packData);
    return response.data;
  },

  togglePackStatus: async (id) => {
    const response = await client.patch(`/admin/packs/${id}/toggle-status`);
    return response.data;
  },

  deletePack: async (id) => {
    const response = await client.delete(`/admin/packs/${id}`);
    return response.data;
  },

  grantUserCredits: async (userId, credits, reason = '') => {
    const response = await client.post(`/admin/packs/users/${userId}/credits`, { credits, reason });
    return response.data;
  },

  // Public Endpoints
  getActivePacks: async (type = null) => {
    const params = type ? { type } : {};
    const response = await client.get('/packs/active', { params });
    return response.data;
  },
};
