import React, { useState } from 'react';
import * as Linking from 'expo-linking';
import { EmailActionScreen } from '../components/EmailActionScreen';

interface ForgotPasswordSentScreenProps {
  onBackToLogin: () => void;
}

export function ForgotPasswordSentScreen({
  onBackToLogin,
}: ForgotPasswordSentScreenProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleOpenEmailApp = async () => {
    setErrorMessage(null);
    try {
      const mailtoUrl = 'mailto:';
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
      } else {
        setErrorMessage("We couldn't find a default email application on this device. Please open your mail app manually.");
      }
    } catch (error) {
      console.error('Failed to open email app:', error);
      setErrorMessage('An error occurred while trying to open your email client.');
    }
  };

  return (
    <EmailActionScreen
      title="Check your inbox"
      subtitle="We've sent a password reset link to your email."
      primaryButtonTitle="Open Email App"
      onPrimaryPress={handleOpenEmailApp}
      onFooterPress={onBackToLogin}
      footerLinkText="Back to Login"
      errorMessage={errorMessage}
    />
  );
}
