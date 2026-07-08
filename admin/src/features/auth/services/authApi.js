import client from '../../../api/client';

const getOrCreateDeviceId = () => {
  let deviceId = localStorage.getItem('autocare_device_id');
  if (!deviceId) {
    try {
      deviceId = crypto.randomUUID();
    } catch (e) {
      // Fallback helper if crypto.randomUUID is unavailable
      deviceId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }
    localStorage.setItem('autocare_device_id', deviceId);
  }
  return deviceId;
};

export const authApi = {
  login: async ({ email, password, rememberMe }) => {
    const deviceId = getOrCreateDeviceId();
    const response = await client.post('/auth/login', {
      email,
      password,
      rememberMe: !!rememberMe,
      deviceId,
    });
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
