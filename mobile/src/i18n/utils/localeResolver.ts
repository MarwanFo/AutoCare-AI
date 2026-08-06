import * as Localization from 'expo-localization';
import { DEFAULT_LANGUAGE, LANGUAGE_CONFIGS } from '../config';
import { SupportedLanguage } from '../types';

/**
 * Normalizes complex locale identifiers (e.g., "en-US", "fr-CA", "ar_MA")
 * down to supported primary language codes ("en", "fr", "ar").
 * Returns null if the language is unsupported.
 */
export function normalizeLanguageCode(input?: string | null): SupportedLanguage | null {
  if (!input || typeof input !== 'string') {
    return null;
  }

  const sanitized = input.trim().toLowerCase().replace('_', '-');
  const primaryCode = sanitized.split('-')[0];

  if (primaryCode && primaryCode in LANGUAGE_CONFIGS) {
    return primaryCode as SupportedLanguage;
  }

  return null;
}

/**
 * Resolves device system locale using expo-localization.
 * Falls back to DEFAULT_LANGUAGE ('en') if unsupported or unavailable.
 */
export function resolveDeviceLanguage(): SupportedLanguage {
  try {
    const locales = Localization.getLocales();
    if (locales && locales.length > 0) {
      for (const locale of locales) {
        const normalized =
          normalizeLanguageCode(locale.languageCode) ||
          normalizeLanguageCode(locale.languageTag);

        if (normalized) {
          return normalized;
        }
      }
    }
  } catch (error) {
    console.warn('[i18n] Exception during device locale detection fallback to default:', error);
  }

  return DEFAULT_LANGUAGE;
}
