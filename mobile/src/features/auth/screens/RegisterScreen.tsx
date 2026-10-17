import React, { useState } from 'react';
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

import { apiClient } from '@/api/client';
import { secureStore } from '@/storage/secureStore';
import { useAppTranslation } from '@/i18n/hooks/useAppTranslation';
import { useAuthStore } from '@/stores/authStore';
import { BrandHeader } from '../components/BrandHeader';
import { AuthCard } from '../components/AuthCard';
import { RegisterForm, RegisterFormData } from '../components/RegisterForm';
import { GoogleButton } from '../components/GoogleButton';
import { ErrorBanner } from '../components/ErrorBanner';
import { passwordSchema } from '../validation';
import { performGoogleSignIn } from '../services/googleAuth';

// Registration schema matches backend DTO restrictions
const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Full name must be between 2 and 100 characters')
      .max(100, 'Full name cannot exceed 100 characters'),
    email: z
      .string()
      .min(1, 'Email Address is required')
      .email('Invalid email address'),
    phoneNumber: z
      .string()
      .min(1, 'Phone number is required')
      .regex(/^\+[1-9]\d{1,14}$/, 'Phone number must be in standard international format (E.164)'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

interface RegisterScreenProps {
  onSwitchToLogin: () => void;
  onRegisterSuccess: (email: string) => void;
}

export function RegisterScreen({
  onSwitchToLogin,
  onRegisterSuccess,
}: RegisterScreenProps) {
  const { t } = useAppTranslation(['auth', 'common', 'errors', 'validation']);
  const { setSession } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', phoneNumber: '', password: '', confirmPassword: '' },
  });

  // Watch password to feed into the password strength meter
  const watchedPassword = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      // Send fields matching backend RegisterRequest DTO
      await apiClient.post('/api/v1/auth/register', {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
      });

      // Automatically sign in the user since email verification is disabled
      try {
        let deviceId = await secureStore.getItem('device_id');
        if (!deviceId) {
          deviceId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          });
          await secureStore.setItem('device_id', deviceId);
        }

        const loginResponse = await apiClient.post('/api/v1/auth/mobile/login', {
          email: data.email,
          password: data.password,
          rememberMe: true,
          deviceId,
        });

        const { accessToken, refreshToken, user } = loginResponse.data;
        if (accessToken && refreshToken) {
          await secureStore.setItem('access_token', accessToken);
          await secureStore.setItem('refresh_token', refreshToken);
          setSession(accessToken, user);
          return;
        }
      } catch (autoLoginErr) {
        console.warn('Auto-login following registration bypassed, falling back to login screen:', autoLoginErr);
      }

      // Fallback: Notify parent to navigate
      onRegisterSuccess(data.email);
    } catch (error: any) {
      console.error('Registration failed:', error);
      if (error.response) {
        const serverError = error.response.data;
        setErrorMessage(
          serverError?.message ||
            serverError?.error ||
            t('errors:unexpected_error')
        );
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
        onRegisterSuccess(result.email);
        setIsLoading(false);
        return;
      }

      setSession(result.accessToken, result.user);
    } catch (error: any) {
      console.error('Google register failed:', error);
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Abstract Background Glows */}
      <View style={styles.topGlow} pointerEvents="none" />
      <View style={styles.bottomGlow} pointerEvents="none" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header branding */}
          <BrandHeader subtitle={t('auth:register_subtitle')} />

          {/* Validation/Network Error Alert Banner */}
          <ErrorBanner message={errorMessage} />

          {/* Form container card wrapper */}
          <AuthCard>
            <RegisterForm
              control={control}
              errors={errors}
              isLoading={isLoading}
              handleSubmit={handleSubmit}
              onSubmit={onSubmit}
              watchedPassword={watchedPassword}
            />
            <GoogleButton
              title={t('auth:continue_with_google')}
              onPress={handleGoogleSignIn}
              isLoading={isLoading}
            />
          </AuthCard>

          {/* Sign-in Navigation Footer */}
          <View style={styles.screenFooter}>
            <Text style={styles.footerText}>{t('auth:already_have_account')}</Text>
            <TouchableOpacity
              accessibilityRole="link"
              accessibilityLabel={t('auth:sign_in_button')}
              style={styles.footerLinkContainer}
              onPress={onSwitchToLogin}
              disabled={isLoading}
            >
              <Text style={styles.footerLinkText}>{t('auth:sign_in_button')}</Text>
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
  keyboardView: {
    flex: 1,
    zIndex: 10,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
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
  screenFooter: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#94A3B8',
  },
  footerLinkContainer: {
    marginLeft: 6,
    paddingVertical: 4,
  },
  footerLinkText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '700',
    color: '#3B82F6',
  },
});
