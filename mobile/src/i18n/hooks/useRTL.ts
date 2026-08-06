import { useI18nStore } from '../i18nStore';
import { getFlexDirection, getIconTransform, getTextAlign } from '../utils/rtlUtils';

export function useRTL() {
  const isRTL = useI18nStore((state) => state.isRTL);

  return {
    isRTL,
    flexDirection: getFlexDirection(isRTL),
    textAlign: getTextAlign(isRTL),
    iconTransform: getIconTransform(isRTL),
    getFlexDirection: (dir: 'row' | 'column' = 'row') => getFlexDirection(isRTL, dir),
    getTextAlign: (align: 'left' | 'right' | 'center' = 'left') => getTextAlign(isRTL, align),
  };
}
