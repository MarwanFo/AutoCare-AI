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
import Animated, { FadeIn } from 'react-native-reanimated';

import { apiClient } from '@/api/client';
import { useAppTranslation } from '@/i18n/hooks/useAppTranslation';
import { BrandHeader } from '../components/BrandHeader';
import { AuthCard } from '../components/AuthCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { ErrorBanner } from '../components/ErrorBanner';
import { FloatingInput, MailIcon } from '../components/PasswordInput';

const forgotSchema = z.object({
  email: z.string().min(1, 'Email Address is required').email('Invalid email address'),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

interface ForgotPasswordScreenProps {
  onBackToLogin: () => void;
  onForgotPasswordSuccess: (email: string) => void;
}

export function ForgotPasswordScreen({
  onBackToLogin,
  onForgotPasswordSuccess,
}: ForgotPasswordScreenProps) {
  const { t } = useAppTranslation(['auth', 'common', 'errors', 'validation']);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotFormData) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await apiClient.post('/api/v1/auth/forgot-password', {
        email: data.email,
      });
      onForgotPasswordSuccess(data.email);
    } catch (error: any) {
      console.error('Forgot password request failed:', error);
      if (error.response) {
        setErrorMessage(error.response.data?.message || t('errors:unexpected_error'));
      } else {
        setErrorMessage(t('errors:network_error'));
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
          {/* Brand header */}
          <BrandHeader subtitle={t('auth:forgot_password_subtitle')} />

          {/* Error Banner */}
          <ErrorBanner message={errorMessage} />

          {/* Premium Animated Layout Card */}
          <Animated.View entering={FadeIn.duration(400)} style={styles.animationWrapper}>
            <AuthCard>
              <View style={styles.cardContent}>
                {/* Title */}
                <Text style={styles.cardTitle}>{t('auth:forgot_password_title')}</Text>

                {/* Subtitle */}
                <Text style={styles.cardBody}>
                  {t('auth:forgot_password_subtitle')}
                </Text>

                {/* Email Input Field */}
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FloatingInput
                      label={t('auth:email_label')}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.email?.message as string}
                      editable={!isLoading}
                      keyboardType="email-address"
                      prefixIcon={<MailIcon color={errors.email ? '#EF4444' : '#94A3B8'} />}
                    />
                  )}
                />

                {/* Actions container */}
                <View style={styles.buttonsContainer}>
                  <PrimaryButton
                    title={t('auth:send_reset_link')}
                    isLoading={isLoading}
                    onPress={handleSubmit(onSubmit)}
                  />
                </View>
              </View>
            </AuthCard>
          </Animated.View>

          {/* Bottom link */}
          <View style={styles.footer}>
            <TouchableOpacity
              accessibilityRole="link"
              accessibilityLabel={t('auth:back_to_sign_in')}
              onPress={onBackToLogin}
              style={styles.footerLinkContainer}
              disabled={isLoading}
            >
              <Text style={styles.footerLinkText}>{t('auth:back_to_sign_in')}</Text>
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
  animationWrapper: {
    width: '100%',
  },
  cardContent: {
    alignItems: 'stretch',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  cardTitle: {
    fontSize: 22,
    fontFamily: 'Inter',
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardBody: {
    fontSize: 13,
    fontFamily: 'Inter',
    color: '#94A3B8',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonsContainer: {
    width: '100%',
    marginTop: 8,
    alignItems: 'center',
  },
  footer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerLinkContainer: {
    paddingVertical: 6,
  },
  footerLinkText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '700',
    color: '#3B82F6',
  },
});
