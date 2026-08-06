import React, { useState } from 'react';
import * as Linking from 'expo-linking';
import { EmailActionScreen } from '../components/EmailActionScreen';
import { useAppTranslation } from '@/i18n/hooks/useAppTranslation';

interface ForgotPasswordSentScreenProps {
  onBackToLogin: () => void;
}

export function ForgotPasswordSentScreen({
  onBackToLogin,
}: ForgotPasswordSentScreenProps) {
  const { t } = useAppTranslation(['auth', 'common', 'errors']);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  return (
    <EmailActionScreen
      title={t('auth:check_your_email')}
      subtitle={t('auth:reset_link_sent_msg')}
      primaryButtonTitle="Open Email App"
      onPrimaryPress={handleOpenEmailApp}
      onFooterPress={onBackToLogin}
      footerLinkText={t('auth:back_to_sign_in')}
      errorMessage={errorMessage}
    />
  );
}
