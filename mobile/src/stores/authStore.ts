import { create } from 'zustand';

export interface User {
  id?: string;
  email: string;
  fullName: string;
  roles: string[];
  permissions: string[];
  status?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSession: (accessToken: string, user: User) => void;
  clearSession: () => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  setSession: (accessToken, user) => set({ accessToken, user, isAuthenticated: true, isLoading: false }),
  clearSession: () => set({ accessToken: null, user: null, isAuthenticated: false, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));
