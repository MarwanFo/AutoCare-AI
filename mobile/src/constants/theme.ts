/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    background: '#F8FAFC',
    backgroundElement: '#F1F5F9',
    backgroundSelected: '#E2E8F0',
    card: '#FFFFFF',
    cardBorder: 'rgba(15, 23, 42, 0.08)',
    primary: '#2563EB',
    primarySubtle: 'rgba(37, 99, 235, 0.10)',
    primaryText: '#FFFFFF',
    statusGood: '#10B981',
    statusGoodSubtle: 'rgba(16, 185, 129, 0.12)',
    statusWarning: '#F59E0B',
    statusWarningSubtle: 'rgba(245, 158, 11, 0.12)',
    statusDanger: '#EF4444',
    statusDangerSubtle: 'rgba(239, 68, 68, 0.12)',
    statusUnknown: '#64748B',
    surfaceHighlight: '#FFFFFF',
  },
  dark: {
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    background: '#0B0D11',
    backgroundElement: '#131722',
    backgroundSelected: '#1E2436',
    card: '#131722',
    cardBorder: 'rgba(255, 255, 255, 0.08)',
    primary: '#3B82F6',
    primarySubtle: 'rgba(59, 130, 246, 0.14)',
    primaryText: '#FFFFFF',
    statusGood: '#10B981',
    statusGoodSubtle: 'rgba(16, 185, 129, 0.15)',
    statusWarning: '#F59E0B',
    statusWarningSubtle: 'rgba(245, 158, 11, 0.15)',
    statusDanger: '#EF4444',
    statusDangerSubtle: 'rgba(239, 68, 68, 0.15)',
    statusUnknown: '#64748B',
    surfaceHighlight: '#181D2A',
  },
} as const;

export const AutomotiveTheme = {
  colors: {
    carbonBase: '#0B0D11',
    surfaceLow: '#11141B',
    surfaceCard: '#141824',
    surfaceHigh: '#1C2232',
    borderMuted: 'rgba(255, 255, 255, 0.07)',
    borderActive: 'rgba(59, 130, 246, 0.4)',
    cobaltPrimary: '#3B82F6',
    cobaltDark: '#1D4ED8',
    cobaltGlow: 'rgba(59, 130, 246, 0.18)',
    healthGood: '#10B981',
    healthWarning: '#F59E0B',
    healthDanger: '#EF4444',
    healthUnknown: '#64748B',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    tabularFigure: '#FFFFFF',
  },
  radii: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },
  shadows: {
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 14,
      elevation: 4,
    },
    subtle: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 2,
    },
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
