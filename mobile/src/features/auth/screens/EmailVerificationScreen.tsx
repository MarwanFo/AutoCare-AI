import React, { useState, useEffect, useRef } from 'react';
import * as Linking from 'expo-linking';
import { apiClient } from '@/api/client';
import { EmailActionScreen } from '../components/EmailActionScreen';

interface EmailVerificationScreenProps {
  email: string;
  onBackToLogin: () => void;
}

export function EmailVerificationScreen({
  email,
  onBackToLogin,
}: EmailVerificationScreenProps) {
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

      // Show the success confirmation banner inside EmailActionScreen
      setShowSuccessConfirmation(true);

      // Automatically dismiss confirmation and start 60s cooldown after 4 seconds
      autoStartRef.current = setTimeout(() => {
        dismissConfirmationAndStartCooldown();
      }, 4000);

    } catch (error: any) {
      console.error('Resend verification failed:', error);
      if (error.response) {
        setErrorMessage(error.response.data?.message || 'Failed to resend verification email.');
      } else {
        setErrorMessage('Network connection lost. Please try again.');
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
        setErrorMessage("We couldn't find a default email application on this device. Please open your mail app manually.");
      }
    } catch (error) {
      console.error('Failed to open email app:', error);
      setErrorMessage('An error occurred while trying to open your email client.');
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
      title="Verify your email"
      subtitle={`We've sent a verification link to your email address.\nPlease verify your account before signing in.`}
      email={email}
      primaryButtonTitle="Open Email App"
      onPrimaryPress={handleOpenEmailApp}
      isPrimaryLoading={isLoading}
      secondaryButtonTitle={
        isLoading
          ? 'Sending...'
          : cooldown > 0
          ? `Resend in ${formatCooldown(cooldown)}`
          : 'Resend verification email'
      }
      onSecondaryPress={handleResend}
      isSecondaryDisabled={cooldown > 0 || isLoading}
      showSuccessConfirmation={showSuccessConfirmation}
      successTitle="Email Sent"
      successText="A new verification link has been sent to your inbox."
      onDismissSuccess={dismissConfirmationAndStartCooldown}
      onFooterPress={onBackToLogin}
      footerLinkText="Back to Login"
      errorMessage={errorMessage}
    />
  );
}
