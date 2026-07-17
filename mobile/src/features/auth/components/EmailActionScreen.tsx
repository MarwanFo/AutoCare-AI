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
  
  // Optional secondary action button (like Resend)
  secondaryButtonTitle?: string;
  onSecondaryPress?: () => void;
  isSecondaryDisabled?: boolean;

  // Optional success banner
  showSuccessConfirmation?: boolean;
  successTitle?: string;
  successText?: string;
  onDismissSuccess?: () => void;

  onFooterPress: () => void;
  footerLinkText: string;

  errorMessage?: string | null;
}

// Premium envelope with check icon illustration matching Stitch style
export function EmailCheckIcon() {
  return (
    <Svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      {/* Background soft circle */}
      <Circle cx="32" cy="32" r="32" fill="#202020" />
      <Circle cx="32" cy="32" r="31" stroke="#2c2c2c" strokeWidth="2" />
      
      {/* Envelope path */}
      <Path
        d="M18 22h28c1.65 0 3 1.35 3 3v16c0 1.65-1.35 3-3 3H18c-1.65 0-3-1.35-3-3V25c0-1.65 1.35-3 3-3z"
        stroke="#e5e2e1"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Envelope flap line */}
      <Path
        d="M15 25l17 11 17-11"
        stroke="#e5e2e1"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Blue checklist checkmark circle badge at bottom-right */}
      <Circle cx="44" cy="44" r="12" fill="#abc7ff" />
      <Path
        d="M39 44l3 3 6-6"
        stroke="#131313"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Custom simple Check SVG for success confirmation card
function InfoCheckIcon() {
  return (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill="#abc7ff" />
      <Path
        d="M8.5 12.5l2.5 2.5 5-5"
        stroke="#131313"
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
          <Animated.View entering={FadeIn.duration(500)} style={styles.animationWrapper}>
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

                {/* Actions container */}
                {!showSuccessConfirmation && (
                  <View style={styles.buttonsContainer}>
                    {/* Primary Button */}
                    <PrimaryButton
                      title={primaryButtonTitle}
                      isLoading={isPrimaryLoading}
                      onPress={onPrimaryPress}
                    />

                    {/* Secondary Text Link */}
                    {secondaryButtonTitle && onSecondaryPress ? (
                      <TouchableOpacity
                        style={[
                          styles.secondaryButton,
                          isSecondaryDisabled && styles.disabledSecondaryBtn,
                        ]}
                        onPress={onSecondaryPress}
                        disabled={isSecondaryDisabled}
                        accessibilityRole="button"
                        accessibilityLabel={secondaryButtonTitle}
                      >
                        <Text style={styles.secondaryButtonText}>
                          {secondaryButtonTitle}
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                )}
              </View>
            </AuthCard>
          </Animated.View>

          {/* Bottom link */}
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
  animationWrapper: {
    width: '100%',
  },
  cardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  iconWrapper: {
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 24,
    fontFamily: 'Inter',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  cardBody: {
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#c4c7c8', // text-on-surface-variant = #c4c7c8
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  emailBadge: {
    backgroundColor: '#202020',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2c2c2c',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 28,
  },
  emailText: {
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '500',
    color: '#abc7ff', // text-secondary = #abc7ff
  },
  buttonsContainer: {
    width: '100%',
    gap: 16,
    alignItems: 'center',
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledSecondaryBtn: {
    opacity: 0.6,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '600', // font-button = 600
    color: '#abc7ff', // text-secondary = #abc7ff
  },
  successBanner: {
    backgroundColor: '#1b231f', // Soft dark green glassmorphic hue
    borderWidth: 1,
    borderColor: '#435147',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  successHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 15,
    fontFamily: 'Inter',
    fontWeight: '700',
    color: '#abc7ff',
  },
  successText: {
    fontSize: 13,
    fontFamily: 'Inter',
    color: '#c4c7c8',
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 12,
  },
  dismissBtn: {
    backgroundColor: '#2c2c2c',
    borderRadius: 9999,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#444748',
  },
  dismissBtnText: {
    fontSize: 12,
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#e5e2e1',
  },
  footer: {
    marginTop: 32,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerLinkContainer: {
    paddingVertical: 8,
  },
  footerLinkText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600', // font-medium
    color: '#ffffff', // text-primary = #ffffff
    textDecorationLine: 'underline',
  },
});
