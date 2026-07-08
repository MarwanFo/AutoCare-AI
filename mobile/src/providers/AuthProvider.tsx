import React, { createContext, useContext, useEffect } from 'react';
import { secureStore } from '@/storage/secureStore';
import { useAuthStore } from '@/stores/authStore';
import { apiClient } from '@/api/client';

interface AuthContextType {}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setSession, clearSession, setLoading } = useAuthStore();

  useEffect(() => {
    async function bootstrapAsync() {
      try {
        const accessToken = await secureStore.getItem('access_token');
        const refreshToken = await secureStore.getItem('refresh_token');

        if (accessToken && refreshToken) {
          // Attempt to fetch profile info to verify accessToken
          try {
            // Setup temp auth header for profile request
            const response = await apiClient.get('/api/v1/auth/me', {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            const user = response.data;
            setSession(accessToken, user);
          } catch (e) {
            // Access token might be expired. Let interceptor handle rotation
            try {
              const refreshResponse = await apiClient.post('/api/v1/auth/mobile/refresh', {
                refreshToken,
              });
              const { accessToken: newAccessToken, refreshToken: newRefreshToken, user } = refreshResponse.data;
              await secureStore.setItem('access_token', newAccessToken);
              await secureStore.setItem('refresh_token', newRefreshToken);
              setSession(newAccessToken, user);
            } catch (refreshErr) {
              // Rotation failed too, wipe session
              await secureStore.deleteItem('access_token');
              await secureStore.deleteItem('refresh_token');
              clearSession();
            }
          }
        } else {
          clearSession();
        }
      } catch (err) {
        console.error('Error during Auth boot token recovery:', err);
        clearSession();
      } finally {
        setLoading(false);
      }
    }

    bootstrapAsync();
  }, []);

  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
