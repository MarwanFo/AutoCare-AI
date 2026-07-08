import client from '../../../api/client';

export const authApi = {
  login: async ({ email, password, rememberMe }) => {
    const response = await client.post('/auth/login', { email, password, rememberMe });
    return response.data;
  },

  register: async ({ email, password, fullName, phoneNumber }) => {
    const response = await client.post('/auth/register', { email, password, fullName, phoneNumber });
    return response.data;
  },

  verifyEmail: async (token) => {
    const response = await client.get(`/auth/verify-email?token=${encodeURIComponent(token)}`);
    return response.data;
  },

  resendVerification: async (email) => {
    const response = await client.post('/auth/resend-verification', { email });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await client.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async ({ token, newPassword, confirmPassword }) => {
    const response = await client.post('/auth/reset-password', { token, newPassword, confirmPassword });
    return response.data;
  },

  changePassword: async ({ oldPassword, newPassword, confirmPassword }) => {
    const response = await client.post('/auth/change-password', { oldPassword, newPassword, confirmPassword });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await client.get('/auth/me');
    return response.data;
  },

  logout: async () => {
    const response = await client.post('/auth/logout');
    return response.data;
  },

  logoutAll: async () => {
    const response = await client.post('/auth/logout-all');
    return response.data;
  },

  listSessions: async () => {
    const response = await client.get('/auth/sessions');
    return response.data;
  },

  revokeSession: async (sessionId) => {
    const response = await client.delete(`/auth/sessions/${sessionId}`);
    return response.data;
  },
};
