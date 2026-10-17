import { DarkTheme, DefaultTheme, ThemeProvider as ExpoThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme, ActivityIndicator, View } from 'react-native';
import React, { useEffect } from 'react';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { QueryProvider } from '@/providers/QueryProvider';
import { ThemeProvider, useAppTheme } from '@/theme/ThemeProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { useAuthStore } from '@/stores/authStore';

SplashScreen.preventAutoHideAsync();

import LoginScreen from '@/features/auth/screens/LoginScreen';

function RootNavigator() {
  console.log('[DEBUG] RootNavigator rendering...');
  const { colorScheme } = useAppTheme();
  const { isAuthenticated, isLoading } = useAuthStore();
  console.log('[DEBUG] Auth state:', { isAuthenticated, isLoading, colorScheme });

  // Route to different root components depending on auth state
  if (isLoading) {
    console.log('[DEBUG] Rendering AnimatedSplashOverlay...');
    return <AnimatedSplashOverlay />;
  }

  const expoTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  console.log('[DEBUG] Rendering target screen:', isAuthenticated ? 'AppTabs' : 'LoginScreen');
  return (
    <ExpoThemeProvider value={expoTheme}>
      {isAuthenticated ? <AppTabs /> : <LoginScreen />}
    </ExpoThemeProvider>
  );
}

import { LanguageProvider } from '@/providers/LanguageProvider';

export default function TabLayout() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <RootNavigator />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}
