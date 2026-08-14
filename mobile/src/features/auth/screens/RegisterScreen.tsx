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

      // Navigate to the verification waiting view
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header branding */}
          <BrandHeader />

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
    backgroundColor: '#131313',
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
    paddingVertical: 32,
  },
  topGlow: {
    position: 'absolute',
    top: '-15%',
    right: '-15%',
    width: '75%',
    aspectRatio: 1,
    borderRadius: 9999,
    backgroundColor: '#abc7ff',
    opacity: 0.05,
    zIndex: 1,
  },
  bottomGlow: {
    position: 'absolute',
    bottom: '-15%',
    left: '-15%',
    width: '60%',
    aspectRatio: 1,
    borderRadius: 9999,
    backgroundColor: '#ffffff',
    opacity: 0.05,
    zIndex: 1,
  },
  screenFooter: {
    marginTop: 32,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#c4c7c8',
  },
  footerLinkContainer: {
    marginLeft: 8,
  },
  footerLinkText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    textDecorationLine: 'underline',
  },
});
