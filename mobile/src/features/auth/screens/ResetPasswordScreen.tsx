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
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { apiClient } from '@/api/client';
import { BrandHeader } from '../components/BrandHeader';
import { AuthCard } from '../components/AuthCard';
import { PasswordInput } from '../components/PasswordInput';
import { PasswordStrengthBar } from '../components/PasswordStrengthBar';
import { PrimaryButton } from '../components/PrimaryButton';
import { ErrorBanner } from '../components/ErrorBanner';
import { passwordSchema } from '../validation';

const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordScreenProps {
  token: string;
  onBackToLogin: () => void;
  onResetSuccess: () => void;
}

export function ResetPasswordScreen({
  token,
  onBackToLogin,
  onResetSuccess,
}: ResetPasswordScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const watchedPassword = watch('password');

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await apiClient.post('/api/v1/auth/reset-password', {
        token: token,
        newPassword: data.password,
      });
      onResetSuccess();
    } catch (error: any) {
      console.error('Password reset failed:', error);
      if (error.response) {
        const serverError = error.response.data;
        setErrorMessage(
          serverError?.message ||
            serverError?.error ||
            'Password reset failed. The token may be invalid or expired.'
        );
      } else if (error.request) {
        setErrorMessage('Network connection lost. Please check your connectivity and try again.');
      } else {
        setErrorMessage(error.message || 'An unexpected error occurred. Please try again.');
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

          {/* Form Card wrapper */}
          <AuthCard>
            <View style={styles.formContainer}>
              <Text style={styles.cardTitle}>Create a new password</Text>
              <Text style={styles.cardSubtitle}>
                Choose a strong password for your account.
              </Text>

              {/* Password Input Field */}
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <PasswordInput
                    label="New Password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message}
                    editable={!isLoading}
                  />
                )}
              />

              {/* Interactive Password Strength Indicator */}
              <PasswordStrengthBar password={watchedPassword} />

              {/* Confirm Password Input Field */}
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <PasswordInput
                    label="Confirm Password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.confirmPassword?.message}
                    editable={!isLoading}
                  />
                )}
              />

              {/* Submit Button */}
              <View style={styles.actionContainer}>
                <PrimaryButton
                  title="Reset Password"
                  isLoading={isLoading}
                  onPress={handleSubmit(onSubmit)}
                />
              </View>
            </View>
          </AuthCard>

          {/* Navigation Footer */}
          <View style={styles.screenFooter}>
            <TouchableOpacity
              accessibilityRole="link"
              accessibilityLabel="Back to Login"
              style={styles.footerLinkContainer}
              onPress={onBackToLogin}
              disabled={isLoading}
            >
              <Text style={styles.footerLinkText}>Back to Login</Text>
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
    zIndex: 10,
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
    backgroundColor: '#ffffff', // bg-primary = #ffffff
    opacity: 0.05,
    zIndex: 1,
  },
  formContainer: {
    alignSelf: 'stretch',
  },
  cardTitle: {
    fontSize: 24,
    fontFamily: 'Inter',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#c4c7c8', // text-on-surface-variant = #c4c7c8
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  actionContainer: {
    alignSelf: 'stretch',
    marginTop: 8,
  },
  screenFooter: {
    marginTop: 32,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLinkContainer: {
    paddingVertical: 8,
  },
  footerLinkText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff', // text-primary = #ffffff
    textDecorationLine: 'underline',
  },
});
