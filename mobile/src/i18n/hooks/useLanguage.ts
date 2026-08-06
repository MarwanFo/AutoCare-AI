import { useQueryClient } from '@tanstack/react-query';
import { useI18nStore } from '../i18nStore';
import { LANGUAGE_CONFIGS } from '../config';
import { SupportedLanguage } from '../types';
import { useAuthStore } from '@/stores/authStore';
import { useUpdatePreferences } from '@/hooks/user/useUpdatePreferences';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { UserProfileResponse } from '@/types/user';

export function useLanguage() {
  const queryClient = useQueryClient();
  const currentLanguage = useI18nStore((state) => state.currentLanguage);
  const isRTL = useI18nStore((state) => state.isRTL);
  const isInitialized = useI18nStore((state) => state.isInitialized);
  const setLocalLanguage = useI18nStore((state) => state.setLanguage);

  const updatePreferencesMutation = useUpdatePreferences();

  const changeLanguage = async (newLanguage: SupportedLanguage) => {
    // 1. Update UI, Zustand state, i18next, and local persistent storage immediately
    await setLocalLanguage(newLanguage);

    // 2. Asynchronously sync preference via React Query mutation if authenticated
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    if (isAuthenticated) {
      const upperLanguage = newLanguage.toUpperCase();
      const profile = queryClient.getQueryData<UserProfileResponse>(QUERY_KEYS.USER_PROFILE);

      updatePreferencesMutation.mutate(
        {
          preferredLanguage: upperLanguage as any,
          preferredCurrency: profile?.preferredCurrency ?? 'EUR',
          preferredDistanceUnit: profile?.preferredDistanceUnit ?? 'KM',
          pushNotificationsEnabled: profile?.pushNotificationsEnabled ?? true,
          emailNotificationsEnabled: profile?.emailNotificationsEnabled ?? true,
        },
        {
          onError: (error) => {
            console.warn(
              `[useLanguage] React Query preference sync failed for ${upperLanguage}. Kept local setting intact:`,
              error
            );
          },
        }
      );
    }
  };

  return {
    currentLanguage,
    currentConfig: LANGUAGE_CONFIGS[currentLanguage],
    supportedLanguages: Object.values(LANGUAGE_CONFIGS),
    isRTL,
    isInitialized,
    isSyncing: updatePreferencesMutation.isPending,
    syncError: updatePreferencesMutation.error,
    setLanguage: changeLanguage,
  };
}
