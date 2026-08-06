import { LanguageConfig, Namespace, SupportedLanguage } from './types';

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

export const NAMESPACES: Namespace[] = [
  'common',
  'auth',
  'profile',
  'garage',
  'maintenance',
  'notifications',
  'validation',
  'errors',
];

export const LANGUAGE_CONFIGS: Record<SupportedLanguage, LanguageConfig> = {
  en: {
    code: 'en',
    label: 'English',
    nativeName: 'English',
    isRTL: false,
  },
  fr: {
    code: 'fr',
    label: 'French',
    nativeName: 'Français',
    isRTL: false,
  },
  ar: {
    code: 'ar',
    label: 'Arabic',
    nativeName: 'العربية',
    isRTL: true,
  },
};

export function isRTL(language: SupportedLanguage): boolean {
  return LANGUAGE_CONFIGS[language]?.isRTL ?? false;
}
