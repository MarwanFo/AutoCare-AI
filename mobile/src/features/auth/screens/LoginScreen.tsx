import React, { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { secureStore } from '@/storage/secureStore';
import { useAuthStore } from '@/stores/authStore';
import { apiClient } from '@/api/client';

import { BrandHeader } from '../components/BrandHeader';
import { AuthCard } from '../components/AuthCard';
import { LoginForm } from '../components/LoginForm';
import { ErrorBanner } from '../components/ErrorBanner';

import { RegisterScreen } from './RegisterScreen';
import { EmailVerificationScreen } from './EmailVerificationScreen';
import { ForgotPasswordScreen } from './ForgotPasswordScreen';
import { ForgotPasswordSentScreen } from './ForgotPasswordSentScreen';
import { ResetPasswordScreen } from './ResetPasswordScreen';
import { ResetPasswordSuccessScreen } from './ResetPasswordSuccessScreen';
import { AuthScreen } from '../constants';
import { usePasswordResetLink } from '../hooks/usePasswordResetLink';

const loginSchema = z.object({
  email: z.string().min(1, 'Email Address is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { setSession } = useAuthStore();
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>(AuthScreen.LOGIN);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { token: resetToken, shouldStartResetFlow, clearResetFlow } = usePasswordResetLink();

  // Route to reset password screen when deep link is opened with token
  useEffect(() => {
    if (shouldStartResetFlow && resetToken) {
      setErrorMessage(null);
      setCurrentScreen(AuthScreen.RESET_PASSWORD);
    }
  }, [shouldStartResetFlow, resetToken]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      // Get or create unique device UUID to pass to the backend Mobile Login DTO
      let deviceId = await secureStore.getItem('device_id');
      if (!deviceId) {
        deviceId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
        await secureStore.setItem('device_id', deviceId);
      }

      const response = await apiClient.post('/api/v1/auth/mobile/login', {
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
        deviceId: deviceId,
      });

      const { accessToken, refreshToken, user } = response.data;
      if (!accessToken || !refreshToken) {
        throw new Error('Invalid token payload returned from server');
      }

      await secureStore.setItem('access_token', accessToken);
      await secureStore.setItem('refresh_token', refreshToken);
      setSession(accessToken, user);
    } catch (error: any) {
      console.error('Mobile authentication failed:', error);
      if (error.response) {
        const serverError = error.response.data;
        setErrorMessage(serverError?.message || serverError?.error || 'Invalid credentials or validation failed');
      } else if (error.request) {
        setErrorMessage('Network connection lost. Please check your network connectivity and try again.');
      } else {
        setErrorMessage(error.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setErrorMessage(null);
    setCurrentScreen(AuthScreen.LOGIN);
  };

  const handleCancelReset = () => {
    clearResetFlow();
    handleBackToLogin();
  };

  if (currentScreen === AuthScreen.REGISTER) {
    return (
      <RegisterScreen
        onSwitchToLogin={handleBackToLogin}
        onRegisterSuccess={(email) => {
          setErrorMessage(null);
          setRegisteredEmail(email);
          setCurrentScreen(AuthScreen.VERIFY_EMAIL);
        }}
      />
    );
  }

  if (currentScreen === AuthScreen.VERIFY_EMAIL) {
    return (
      <EmailVerificationScreen
        email={registeredEmail}
        onBackToLogin={handleBackToLogin}
      />
    );
  }

  if (currentScreen === AuthScreen.FORGOT_PASSWORD) {
    return (
      <ForgotPasswordScreen
        onBackToLogin={handleBackToLogin}
        onForgotPasswordSuccess={() => {
          setErrorMessage(null);
          setCurrentScreen(AuthScreen.FORGOT_PASSWORD_SENT);
        }}
      />
    );
  }

  if (currentScreen === AuthScreen.FORGOT_PASSWORD_SENT) {
    return (
      <ForgotPasswordSentScreen
        onBackToLogin={handleBackToLogin}
      />
    );
  }

  if (currentScreen === AuthScreen.RESET_PASSWORD && resetToken) {
    return (
      <ResetPasswordScreen
        token={resetToken}
        onBackToLogin={handleCancelReset}
        onResetSuccess={() => {
          setErrorMessage(null);
          setCurrentScreen(AuthScreen.RESET_PASSWORD_SUCCESS);
        }}
      />
    );
  }

  if (currentScreen === AuthScreen.RESET_PASSWORD_SUCCESS) {
    return (
      <ResetPasswordSuccessScreen
        onBackToLogin={handleCancelReset}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Abstract Background Glows */}
      <View style={styles.topGlow} pointerEvents="none" />
      <View style={styles.bottomGlow} pointerEvents="none" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Branding */}
          <BrandHeader />

          {/* Floating Warning Message Banner */}
          <ErrorBanner message={errorMessage} />

          {/* Form Card wrapper */}
          <AuthCard>
            <LoginForm
              control={control}
              errors={errors}
              isLoading={isLoading}
              handleSubmit={handleSubmit}
              onSubmit={onSubmit}
              onForgotPassword={() => {
                setErrorMessage(null);
                setCurrentScreen(AuthScreen.FORGOT_PASSWORD);
              }}
            />
          </AuthCard>

          {/* Footer Link (Centered Create Account row below card) */}
          <View style={styles.screenFooter}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity
              accessibilityRole="link"
              accessibilityLabel="Create Account"
              style={styles.footerLinkContainer}
              onPress={() => {
                setErrorMessage(null);
                setCurrentScreen(AuthScreen.REGISTER);
              }}
              disabled={isLoading}
            >
              <Text style={styles.footerLinkText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131313', // bg-surface-dim = #131313
    position: 'relative',
    overflow: 'hidden',
  },
  keyboardView: {
    flex: 1,
    zIndex: 10, // Main content layer
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20, // p-container-padding-mobile
    paddingVertical: 32,
  },
  topGlow: {
    position: 'absolute',
    top: '-15%',
    right: '-15%',
    width: '75%',
    aspectRatio: 1,
    borderRadius: 9999,
    backgroundColor: '#abc7ff', // bg-secondary = #abc7ff
    opacity: 0.05, // opacity-5
    zIndex: 1,
  },
  bottomGlow: {
    position: 'absolute',
    bottom: '-15%',
    left: '-15%',
    width: '60%',
    aspectRatio: 1,
    borderRadius: 9999,
    backgroundColor: '#ffffff', // bg-primary = #ffffff
    opacity: 0.05, // opacity-5
    zIndex: 1,
  },
  screenFooter: {
    marginTop: 32, // mt-8 = 32px
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#c4c7c8', // text-on-surface-variant = #c4c7c8
  },
  footerLinkContainer: {
    marginLeft: 8,
  },
  footerLinkText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600', // font-medium
    color: '#ffffff', // text-primary = #ffffff
    textDecorationLine: 'underline',
  },
});
