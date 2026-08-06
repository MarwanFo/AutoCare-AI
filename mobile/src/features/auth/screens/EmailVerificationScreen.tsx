import React, { useState, useEffect, useRef } from 'react';
import * as Linking from 'expo-linking';
import { apiClient } from '@/api/client';
import { EmailActionScreen } from '../components/EmailActionScreen';
import { useAppTranslation } from '@/i18n/hooks/useAppTranslation';

interface EmailVerificationScreenProps {
  email: string;
  onBackToLogin: () => void;
}

export function EmailVerificationScreen({
  email,
  onBackToLogin,
}: EmailVerificationScreenProps) {
  const { t } = useAppTranslation(['auth', 'common', 'errors']);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccessConfirmation, setShowSuccessConfirmation] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  
  const timerRef = useRef<any>(null);
  const autoStartRef = useRef<any>(null);

  // Countdown timer logic
  useEffect(() => {
    if (cooldown <= 0) return;
    
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [cooldown]);

  // Clean up auto-dismiss timers on unmount
  useEffect(() => {
    return () => {
      if (autoStartRef.current) clearTimeout(autoStartRef.current);
    };
  }, []);

  const dismissConfirmationAndStartCooldown = () => {
    setShowSuccessConfirmation(false);
    if (autoStartRef.current) {
      clearTimeout(autoStartRef.current);
      autoStartRef.current = null;
    }
    setCooldown(60);
  };

  const handleResend = async () => {
    if (cooldown > 0 || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);
    setShowSuccessConfirmation(false);

    try {
      await apiClient.post('/api/v1/auth/resend-verification', {
        email: email,
      });

      setShowSuccessConfirmation(true);

      autoStartRef.current = setTimeout(() => {
        dismissConfirmationAndStartCooldown();
      }, 4000);

    } catch (error: any) {
      console.error('Resend verification failed:', error);
      if (error.response) {
        setErrorMessage(error.response.data?.message || t('errors:unexpected_error'));
      } else {
        setErrorMessage(t('errors:network_error'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEmailApp = async () => {
    setErrorMessage(null);
    try {
      const mailtoUrl = 'mailto:';
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
      } else {
        setErrorMessage(t('errors:unexpected_error'));
      }
    } catch (error) {
      console.error('Failed to open email app:', error);
      setErrorMessage(t('errors:unexpected_error'));
    }
  };

  // Helper to format cooldown as MM:SS
  const formatCooldown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <EmailActionScreen
      title={t('auth:verify_email_title')}
      subtitle={t('auth:verify_email_subtitle')}
      email={email}
      primaryButtonTitle="Open Email App"
      onPrimaryPress={handleOpenEmailApp}
      isPrimaryLoading={isLoading}
      secondaryButtonTitle={
        isLoading
          ? t('auth:sending_button')
          : cooldown > 0
          ? `${t('auth:resend_code')} (${formatCooldown(cooldown)})`
          : t('auth:resend_code')
      }
      onSecondaryPress={handleResend}
      isSecondaryDisabled={cooldown > 0 || isLoading}
      showSuccessConfirmation={showSuccessConfirmation}
      successTitle={t('common:success')}
      successText={t('auth:reset_link_sent_msg')}
      onDismissSuccess={dismissConfirmationAndStartCooldown}
      onFooterPress={onBackToLogin}
      footerLinkText={t('auth:back_to_sign_in')}
      errorMessage={errorMessage}
    />
  );
}
