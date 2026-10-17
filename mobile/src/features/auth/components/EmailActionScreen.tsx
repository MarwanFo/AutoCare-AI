import React from 'react';
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
import Svg, { Path, Circle } from 'react-native-svg';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { BrandHeader } from './BrandHeader';
import { AuthCard } from './AuthCard';
import { PrimaryButton } from './PrimaryButton';
import { ErrorBanner } from './ErrorBanner';

export interface EmailActionScreenProps {
  title: string;
  subtitle: string;
  email?: string;
  primaryButtonTitle: string;
  onPrimaryPress: () => void;
  isPrimaryLoading?: boolean;
  
  secondaryButtonTitle?: string;
  onSecondaryPress?: () => void;
  isSecondaryDisabled?: boolean;

  showSuccessConfirmation?: boolean;
  successTitle?: string;
  successText?: string;
  onDismissSuccess?: () => void;

  onFooterPress: () => void;
  footerLinkText: string;

  errorMessage?: string | null;
}

// Premium envelope with check icon illustration matching modern styling
export function EmailCheckIcon() {
  return (
    <Svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      <Circle cx="32" cy="32" r="32" fill="#141824" />
      <Circle cx="32" cy="32" r="31" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="2" />
      
      <Path
        d="M18 22h28c1.65 0 3 1.35 3 3v16c0 1.65-1.35 3-3 3H18c-1.65 0-3-1.35-3-3V25c0-1.65 1.35-3 3-3z"
        stroke="#F8FAFC"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15 25l17 11 17-11"
        stroke="#F8FAFC"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <Circle cx="44" cy="44" r="12" fill="#3B82F6" />
      <Path
        d="M39 44l3 3 6-6"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function InfoCheckIcon() {
  return (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill="#3B82F6" />
      <Path
        d="M8.5 12.5l2.5 2.5 5-5"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function EmailActionScreen({
  title,
  subtitle,
  email,
  primaryButtonTitle,
  onPrimaryPress,
  isPrimaryLoading = false,
  secondaryButtonTitle,
  onSecondaryPress,
  isSecondaryDisabled = false,
  showSuccessConfirmation = false,
  successTitle = 'Email Sent',
  successText,
  onDismissSuccess,
  onFooterPress,
  footerLinkText,
  errorMessage,
}: EmailActionScreenProps) {
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
          <BrandHeader />

          {/* Error Banner */}
          <ErrorBanner message={errorMessage ?? null} />

          {/* Premium Animated Layout Card */}
          <Animated.View entering={FadeIn.duration(400)} style={styles.animationWrapper}>
            <AuthCard>
              <View style={styles.cardContent}>
                
                {/* Visual Envelope Checkmark Illustration */}
                <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.iconWrapper}>
                  <EmailCheckIcon />
                </Animated.View>

                {/* Title */}
                <Text style={styles.cardTitle}>{title}</Text>

                {/* Subtitle */}
                <Text style={styles.cardBody}>{subtitle}</Text>

                {/* Registered Email Indicator */}
                {email ? (
                  <View style={styles.emailBadge}>
                    <Text style={styles.emailText}>{email}</Text>
                  </View>
                ) : null}

                {/* Success Confirmation Banner inside the Card */}
                {showSuccessConfirmation && (
                  <Animated.View entering={FadeIn.duration(300)} style={styles.successBanner}>
                    <View style={styles.successHeader}>
                      <InfoCheckIcon />
                      <Text style={styles.successTitle}>{successTitle}</Text>
                    </View>
                    {successText ? <Text style={styles.successText}>{successText}</Text> : null}
                    {onDismissSuccess ? (
                      <TouchableOpacity
                        style={styles.dismissBtn}
                        onPress={onDismissSuccess}
                        accessibilityRole="button"
                        accessibilityLabel="Dismiss confirmation"
                      >
                        <Text style={styles.dismissBtnText}>Got it</Text>
                      </TouchableOpacity>
                    ) : null}
                  </Animated.View>
                )}

                {/* Main Action Buttons */}
                <View style={styles.buttonsContainer}>
                  <PrimaryButton
                    title={primaryButtonTitle}
                    isLoading={isPrimaryLoading}
                    onPress={onPrimaryPress}
                  />

                  {secondaryButtonTitle && onSecondaryPress ? (
                    <TouchableOpacity
                      onPress={onSecondaryPress}
                      disabled={isSecondaryDisabled}
                      style={[
                        styles.secondaryButton,
                        isSecondaryDisabled && styles.disabledSecondaryBtn,
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={secondaryButtonTitle}
                    >
                      <Text style={styles.secondaryButtonText}>
                        {secondaryButtonTitle}
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            </AuthCard>
          </Animated.View>

          {/* Footer Back Link */}
          <View style={styles.footer}>
            <TouchableOpacity
              accessibilityRole="link"
              accessibilityLabel={footerLinkText}
              onPress={onFooterPress}
              style={styles.footerLinkContainer}
            >
              <Text style={styles.footerLinkText}>{footerLinkText}</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  iconWrapper: {
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  emailBadge: {
    backgroundColor: '#181D2A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  emailText: {
    fontSize: 13,
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#3B82F6',
  },
  buttonsContainer: {
    width: '100%',
    gap: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledSecondaryBtn: {
    opacity: 0.5,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#3B82F6',
  },
  successBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 14,
    padding: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  successHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  successTitle: {
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '700',
    color: '#34D399',
  },
  successText: {
    fontSize: 12,
    fontFamily: 'Inter',
    color: '#E2E8F0',
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 10,
  },
  dismissBtn: {
    backgroundColor: '#1E2436',
    borderRadius: 9999,
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dismissBtnText: {
    fontSize: 11,
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#F8FAFC',
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
