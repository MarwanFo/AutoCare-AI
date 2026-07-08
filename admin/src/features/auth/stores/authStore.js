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

  login: (token, user) => set({
    accessToken: token,
    user,
    isAuthenticated: true,
    isLoading: false,
  }),

  logout: () => set({
    accessToken: null,
    user: null,
    isAuthenticated: false,
    isLoading: false,
  }),

  setLoading: (isLoading) => set({ isLoading }),
}));
