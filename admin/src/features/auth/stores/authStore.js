import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  setToken: (token) => set({ 
    accessToken: token, 
    isAuthenticated: !!token 
  }),

  setUser: (user) => set({ user }),

  login: (token, user) => {
    localStorage.setItem('autocare_has_session', 'true');
    set({
      accessToken: token,
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: () => {
    localStorage.removeItem('autocare_has_session');
    set({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  setLoading: (isLoading) => set({ isLoading }),
}));
