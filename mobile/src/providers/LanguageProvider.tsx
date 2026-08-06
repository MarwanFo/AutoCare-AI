import React, { useEffect } from 'react';
import '@/i18n';
import { useI18nStore } from '@/i18n/i18nStore';

interface LanguageProviderProps {
  children: React.ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const hydrateLanguage = useI18nStore((state) => state.hydrateLanguage);

  useEffect(() => {
    hydrateLanguage();
  }, [hydrateLanguage]);

  return <>{children}</>;
}
