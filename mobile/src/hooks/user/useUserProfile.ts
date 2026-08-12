import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { userApi } from '@/api/userApi';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { useAuthStore } from '@/stores/authStore';
import { useI18nStore } from '@/i18n/i18nStore';
import { normalizeLanguageCode } from '@/i18n/utils/localeResolver';

export function useUserProfile() {
  const query = useQuery({
    queryKey: QUERY_KEYS.USER_PROFILE,
    queryFn: userApi.getUserProfile,
  });

  const updateUser = useAuthStore((state) => state.updateUser);

  useEffect(() => {
    if (query.data) {
      updateUser({
        id: query.data.id,
        email: query.data.email,
        fullName: query.data.fullName,
        roles: Array.isArray(query.data.roles) ? query.data.roles : [],
        permissions: Array.isArray(query.data.permissions) ? query.data.permissions : [],
        status: query.data.status,
        avatarUrl: query.data.avatarUrl,
      });

      // Synchronize cloud preferredLanguage ONLY if local preference hasn't been set by user
      if (query.data.preferredLanguage) {
        const normalizedLang = normalizeLanguageCode(query.data.preferredLanguage);
        const storeState = useI18nStore.getState();
        // If local language store has not been initialized or set, sync from backend
        if (normalizedLang && !storeState.isInitialized) {
          storeState.setLanguage(normalizedLang);
        }
      }
    }
  }, [query.data, updateUser]);

  return query;
}
