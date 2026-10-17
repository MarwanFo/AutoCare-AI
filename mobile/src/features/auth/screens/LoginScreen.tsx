import React, { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
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
import { useAppTranslation } from '@/i18n/hooks/useAppTranslation';
import { useAppTheme } from '@/theme/ThemeProvider';
import { ThemeToggle } from '@/components/ThemeToggle';

import { BrandHeader } from '../components/BrandHeader';
import { AuthCard } from '../components/AuthCard';
import { LoginForm } from '../components/LoginForm';
import { GoogleButton } from '../components/GoogleButton';
import { ErrorBanner } from '../components/ErrorBanner';
import { performGoogleSignIn } from '../services/googleAuth';

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
  console.log('[DEBUG] LoginScreen component mounting...');
  const { t } = useAppTranslation(['auth', 'common', 'errors', 'validation']);
  const { isDark } = useAppTheme();
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

  // While email verification is disabled, automatically return to login if placed on VERIFY_EMAIL
  useEffect(() => {
    if (currentScreen === AuthScreen.VERIFY_EMAIL) {
      setCurrentScreen(AuthScreen.LOGIN);
    }
  }, [currentScreen]);

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
        throw new Error(t('errors:unexpected_error'));
      }

      await secureStore.setItem('access_token', accessToken);
      await secureStore.setItem('refresh_token', refreshToken);
      setSession(accessToken, user);
    } catch (error: any) {
      console.error('Mobile authentication failed:', error);
      if (error.response) {
        const serverError = error.response.data;
        setErrorMessage(serverError?.message || serverError?.error || t('errors:unexpected_error'));
      } else if (error.request) {
        setErrorMessage(t('errors:network_error'));
      } else {
        setErrorMessage(error.message || t('errors:unexpected_error'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await performGoogleSignIn();

      if (result.type === 'CANCELLED') {
        setIsLoading(false);
        return;
      }

      if (result.type === 'VERIFICATION_REQUIRED') {
        // TODO: Re-enable VERIFY_EMAIL screen when email verification is re-enabled
        // setRegisteredEmail(result.email);
        // setCurrentScreen(AuthScreen.VERIFY_EMAIL);
        setIsLoading(false);
        return;
      }

      setSession(result.accessToken, result.user);
    } catch (error: any) {
      console.error('Google login failed:', error);
      if (error.response) {
        const serverError = error.response.data;
        setErrorMessage(serverError?.message || serverError?.error || t('errors:unexpected_error'));
      } else {
        setErrorMessage(error.message || t('errors:unexpected_error'));
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
          // TODO: Re-enable VERIFY_EMAIL screen when email verification is re-enabled
          // setCurrentScreen(AuthScreen.VERIFY_EMAIL);
          setCurrentScreen(AuthScreen.LOGIN);
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
    <SafeAreaView style={[styles.container, !isDark && styles.containerLight]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#0B0D11' : '#F8FAFC'}
      />
      {/* Abstract Background Glows */}
      <View style={[styles.topGlow, !isDark && styles.topGlowLight]} pointerEvents="none" />
      <View style={[styles.bottomGlow, !isDark && styles.bottomGlowLight]} pointerEvents="none" />

      {/* Top Bar with Quick Theme Toggle */}
      <View style={styles.topBar}>
        <ThemeToggle />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
            <GoogleButton
              title={t('auth:continue_with_google')}
              onPress={handleGoogleSignIn}
              isLoading={isLoading}
            />
          </AuthCard>

          {/* Footer Link (Centered Create Account row below card) */}
          <View style={styles.screenFooter}>
            <Text style={[styles.footerText, !isDark && styles.footerTextLight]}>{t('auth:no_account_prompt')}</Text>
            <TouchableOpacity
              accessibilityRole="link"
              accessibilityLabel={t('auth:sign_up_button')}
              style={styles.footerLinkContainer}
              onPress={() => {
                setErrorMessage(null);
                setCurrentScreen(AuthScreen.REGISTER);
              }}
              disabled={isLoading}
            >
              <Text style={styles.footerLinkText}>{t('auth:sign_up_button')}</Text>
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
    backgroundColor: '#0B0D11',
    position: 'relative',
    overflow: 'hidden',
  },
  containerLight: {
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 8,
    zIndex: 20,
  },
  keyboardView: {
    flex: 1,
    zIndex: 10,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  topGlow: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#3B82F6',
    opacity: 0.08,
  },
  topGlowLight: {
    opacity: 0.04,
  },
  bottomGlow: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#1D4ED8',
    opacity: 0.06,
  },
  bottomGlowLight: {
    opacity: 0.03,
  },
  screenFooter: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#94A3B8',
  },
  footerTextLight: {
    color: '#64748B',
  },
  footerLinkContainer: {
    marginLeft: 6,
    paddingVertical: 4,
  },
  footerLinkText: {
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '700',
    color: '#3B82F6',
  },
});
