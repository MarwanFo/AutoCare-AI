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
        const hasSession = localStorage.getItem('autocare_has_session') === 'true';
        if (!hasSession) {
          // No prior session - initialize as anonymous user immediately
          logout();
          return;
        }

        // Prior session detected - attempt silent token rotation
        const response = await client.post('/auth/refresh');
        const { accessToken, user } = response.data;
        login(accessToken, user);
      } catch {
        // Silent failure - expired or invalid session, initialize as guest
        logout();
      } finally {
        // Always resolve the loading state so the UI can render
        setLoading(false);
      }
    };

    initializeAuth();
  }, [login, logout, setLoading]);

  return <>{children}</>;
};
