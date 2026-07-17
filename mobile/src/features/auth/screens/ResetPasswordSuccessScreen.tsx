import React from 'react';
import { EmailActionScreen } from '../components/EmailActionScreen';

interface ResetPasswordSuccessScreenProps {
  onBackToLogin: () => void;
}

export function ResetPasswordSuccessScreen({ onBackToLogin }: ResetPasswordSuccessScreenProps) {
  return (
    <EmailActionScreen
      title="Password updated successfully"
      subtitle="Your password has been updated. You can now sign in with your new password."
      primaryButtonTitle="Go to Login"
      onPrimaryPress={onBackToLogin}
      onFooterPress={onBackToLogin}
      footerLinkText="Back to Login"
    />
  );
}
