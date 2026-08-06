import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LANGUAGE, NAMESPACES } from './config';

import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enProfile from './locales/en/profile.json';
import enGarage from './locales/en/garage.json';
import enMaintenance from './locales/en/maintenance.json';
import enNotifications from './locales/en/notifications.json';
import enValidation from './locales/en/validation.json';
import enErrors from './locales/en/errors.json';

import frCommon from './locales/fr/common.json';
import frAuth from './locales/fr/auth.json';
import frProfile from './locales/fr/profile.json';
import frGarage from './locales/fr/garage.json';
import frMaintenance from './locales/fr/maintenance.json';
import frNotifications from './locales/fr/notifications.json';
import frValidation from './locales/fr/validation.json';
import frErrors from './locales/fr/errors.json';

import arCommon from './locales/ar/common.json';
import arAuth from './locales/ar/auth.json';
import arProfile from './locales/ar/profile.json';
import arGarage from './locales/ar/garage.json';
import arMaintenance from './locales/ar/maintenance.json';
import arNotifications from './locales/ar/notifications.json';
import arValidation from './locales/ar/validation.json';
import arErrors from './locales/ar/errors.json';

export const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    profile: enProfile,
    garage: enGarage,
    maintenance: enMaintenance,
    notifications: enNotifications,
    validation: enValidation,
    errors: enErrors,
  },
  fr: {
    common: frCommon,
    auth: frAuth,
    profile: frProfile,
    garage: frGarage,
    maintenance: frMaintenance,
    notifications: frNotifications,
    validation: frValidation,
    errors: frErrors,
  },
  ar: {
    common: arCommon,
    auth: arAuth,
    profile: arProfile,
    garage: arGarage,
    maintenance: arMaintenance,
    notifications: arNotifications,
    validation: arValidation,
    errors: arErrors,
  },
} as const;

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: DEFAULT_LANGUAGE,
      fallbackLng: DEFAULT_LANGUAGE,
      ns: NAMESPACES,
      defaultNS: 'common',
      interpolation: {
        escapeValue: false,
      },
      debug: __DEV__,
      saveMissing: __DEV__,
      missingKeyHandler: (lngs, ns, key) => {
        if (__DEV__) {
          console.warn(`[i18n] Missing key "${key}" in namespace "${ns}" for language(s): ${lngs.join(', ')}`);
        }
      },
      react: {
        useSuspense: false,
      },
    });
}

export default i18n;
