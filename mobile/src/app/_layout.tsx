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
  const { colorScheme } = useAppTheme();
  const { isAuthenticated, isLoading } = useAuthStore();

  // Route to different root components depending on auth state
  if (isLoading) {
    return <AnimatedSplashOverlay />;
  }

  const expoTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <ExpoThemeProvider value={expoTheme}>
      {isAuthenticated ? <AppTabs /> : <LoginScreen />}
    </ExpoThemeProvider>
  );
}

export default function TabLayout() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <ThemeProvider>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </ThemeProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}
