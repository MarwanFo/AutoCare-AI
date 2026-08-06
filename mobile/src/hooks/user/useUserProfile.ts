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

      // Synchronize authenticated user cloud preferredLanguage to local i18n store
      if (query.data.preferredLanguage) {
        const normalizedLang = normalizeLanguageCode(query.data.preferredLanguage);
        if (normalizedLang && useI18nStore.getState().currentLanguage !== normalizedLang) {
          useI18nStore.getState().setLanguage(normalizedLang);
        }
      }
    }
  }, [query.data, updateUser]);

  return query;
}
