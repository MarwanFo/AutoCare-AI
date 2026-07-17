import { useEffect, useState } from 'react';
import * as Linking from 'expo-linking';

export function usePasswordResetLink() {
  const [token, setToken] = useState<string | null>(null);
  const [shouldStartResetFlow, setShouldStartResetFlow] = useState(false);
  const url = Linking.useURL();

  useEffect(() => {
    if (!url) return;
    try {
      const parsed = Linking.parse(url);
      
      // Matches both native schemes (mobile://reset-password?token=...)
      // and web urls (http://localhost:8081/reset-password?token=...)
      const isResetPath =
        parsed.hostname === 'reset-password' ||
        parsed.path === 'reset-password' ||
        parsed.path === 'reset-password/';
        
      const rawToken = parsed.queryParams?.token;

      // Reset token in backend is UUID string (32 characters without dashes)
      if (isResetPath && typeof rawToken === 'string' && rawToken.trim().length >= 32) {
        setToken(rawToken.trim());
        setShouldStartResetFlow(true);
      }
    } catch (error) {
      console.error('Failed to parse incoming password reset deep link:', error);
    }
  }, [url]);

  const clearResetFlow = () => {
    setToken(null);
    setShouldStartResetFlow(false);
  };

  return {
    token,
    shouldStartResetFlow,
    clearResetFlow,
  };
}
