import React from 'react';
import { EmailActionScreen } from '../components/EmailActionScreen';
import { useAppTranslation } from '@/i18n/hooks/useAppTranslation';

interface ResetPasswordSuccessScreenProps {
  onBackToLogin: () => void;
}

export function ResetPasswordSuccessScreen({ onBackToLogin }: ResetPasswordSuccessScreenProps) {
  const { t } = useAppTranslation(['auth', 'common']);

  return (
    <EmailActionScreen
      title={t('auth:password_reset_success_title')}
      subtitle={t('auth:password_reset_success_msg')}
      primaryButtonTitle={t('auth:sign_in_button')}
      onPrimaryPress={onBackToLogin}
      onFooterPress={onBackToLogin}
      footerLinkText={t('auth:back_to_sign_in')}
    />
  );
}
