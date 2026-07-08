import React, { useEffect, useRef } from 'react';
import client from '../../../api/client';
import { useAuthStore } from '../stores/authStore';

export const AuthProvider = ({ children }) => {
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const setLoading = useAuthStore((state) => state.setLoading);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const initializeAuth = async () => {
      try {
        // Attempt silent refresh to restore session on boot
        const response = await client.post('/auth/refresh');
        const { accessToken, user } = response.data;
        login(accessToken, user);
      } catch (error) {
        // Silent failure - user is guest
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [login, logout, setLoading]);

  return <>{children}</>;
};
