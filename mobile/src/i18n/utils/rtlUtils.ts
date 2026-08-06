import { FlexStyle, TextStyle } from 'react-native';

export function getFlexDirection(isRTL: boolean, defaultDirection: 'row' | 'column' = 'row'): FlexStyle['flexDirection'] {
  if (defaultDirection === 'row') {
    return isRTL ? 'row-reverse' : 'row';
  }
  return defaultDirection;
}

export function getTextAlign(isRTL: boolean, defaultAlign: 'left' | 'right' | 'center' = 'left'): TextStyle['textAlign'] {
  if (defaultAlign === 'center') return 'center';
  if (defaultAlign === 'left') return isRTL ? 'right' : 'left';
  return isRTL ? 'left' : 'right';
}

export function getIconTransform(isRTL: boolean) {
  return [{ scaleX: isRTL ? -1 : 1 }];
}
