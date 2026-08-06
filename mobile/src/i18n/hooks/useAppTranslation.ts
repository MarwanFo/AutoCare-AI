import { useTranslation as useTranslationOriginal } from 'react-i18next';
import { Namespace } from '../types';

export function useAppTranslation(ns: Namespace | Namespace[] = 'common') {
  return useTranslationOriginal(ns);
}
