export type SupportedLanguage = 'en' | 'fr' | 'ar';

export type LanguageDirection = 'ltr' | 'rtl';

export type Namespace =
  | 'common'
  | 'auth'
  | 'profile'
  | 'garage'
  | 'maintenance'
  | 'notifications'
  | 'validation'
  | 'errors';

export interface LanguageConfig {
  code: SupportedLanguage;
  label: string;
  nativeName: string;
  isRTL: boolean;
}

export interface I18nState {
  currentLanguage: SupportedLanguage;
  isRTL: boolean;
  isInitialized: boolean;
  hydrateLanguage: () => Promise<void>;
  setLanguage: (language: SupportedLanguage) => Promise<void>;
}
