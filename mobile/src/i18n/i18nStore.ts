import { create } from 'zustand';
import { I18nManager } from 'react-native';
import i18n from './index';
import { DEFAULT_LANGUAGE, isRTL as checkIsRTL, LANGUAGE_CONFIGS } from './config';
import { I18nState, SupportedLanguage } from './types';
import { normalizeLanguageCode, resolveDeviceLanguage } from './utils/localeResolver';
import { secureStore } from '@/storage/secureStore';

export const STORAGE_KEY = 'user_language_preference';

export const useI18nStore = create<I18nState>((set, get) => ({
  currentLanguage: DEFAULT_LANGUAGE,
  isRTL: checkIsRTL(DEFAULT_LANGUAGE),
  isInitialized: false,

  hydrateLanguage: async () => {
    if (get().isInitialized) return;

    try {
      // 1. Check local persistent storage
      const cachedRaw = await secureStore.getItem(STORAGE_KEY);
      const normalizedCached = normalizeLanguageCode(cachedRaw);

      let targetLang: SupportedLanguage;

      if (normalizedCached) {
        targetLang = normalizedCached;
      } else {
        // 2. Detect device locale with sub-tag parsing (e.g. en-US -> en, fr-CA -> fr)
        // 3. Fallback to DEFAULT_LANGUAGE ('en') if unsupported (e.g. es-ES -> en)
        targetLang = resolveDeviceLanguage();
      }

      const rtl = checkIsRTL(targetLang);

      // Configure native RTL direction
      if (I18nManager.isRTL !== rtl) {
        I18nManager.allowRTL(rtl);
        I18nManager.forceRTL(rtl);
      }

      // Initialize i18next instance if required
      if (i18n.language !== targetLang) {
        await i18n.changeLanguage(targetLang);
      }

      set({
        currentLanguage: targetLang,
        isRTL: rtl,
        isInitialized: true,
      });
    } catch (error) {
      console.warn('[i18nStore] Startup hydration failed, safely resolving to fallback:', error);
      set({
        currentLanguage: DEFAULT_LANGUAGE,
        isRTL: checkIsRTL(DEFAULT_LANGUAGE),
        isInitialized: true,
      });
    }
  },

  setLanguage: async (language: SupportedLanguage) => {
    const normalized = normalizeLanguageCode(language);
    const targetLang = normalized || DEFAULT_LANGUAGE;

    // Avoid redundant executions if language is already active
    if (get().currentLanguage === targetLang && i18n.language === targetLang) {
      return;
    }

    const rtl = checkIsRTL(targetLang);

    try {
      // Persist locally
      await secureStore.setItem(STORAGE_KEY, targetLang);

      // Update i18next active dictionary
      await i18n.changeLanguage(targetLang);

      // Configure native RTL direction
      if (I18nManager.isRTL !== rtl) {
        I18nManager.allowRTL(rtl);
        I18nManager.forceRTL(rtl);
      }

      // Update Zustand state
      set({
        currentLanguage: targetLang,
        isRTL: rtl,
      });
    } catch (error) {
      console.error(`[i18nStore] Failed to set language to ${targetLang}:`, error);
    }
  },
}));
