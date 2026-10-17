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
import Animated, { FadeInDown } from 'react-native-reanimated';
import { WizardProgress } from './WizardProgress';
import { PrimaryButton } from '@/features/auth/components/PrimaryButton';
import Svg, { Path } from 'react-native-svg';

import { OnboardingStep } from '@/types/vehicle';

interface VehicleWizardLayoutProps {
  currentStep: OnboardingStep;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  isNextDisabled?: boolean;
  nextButtonTitle?: string;
  isNextLoading?: boolean;
}

export function VehicleWizardLayout({
  currentStep,
  title,
  subtitle,
  children,
  onBack,
  onNext,
  isNextDisabled = false,
  nextButtonTitle = 'Continue',
  isNextLoading = false,
}: VehicleWizardLayoutProps) {
  return (
    <View style={styles.container}>
      {/* Background Glows */}
      <View style={styles.topGlow} />
      <View style={styles.bottomGlow} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            
            {/* Header Text */}
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>

            {/* Card Content Container */}
            <Animated.View
              entering={FadeInDown.duration(400)}
              style={styles.card}
            >
              {/* Top Accent Gradient Bar Accent */}
              <View style={styles.topAccentBarContainer}>
                <View style={styles.topAccentBar} />
              </View>

              {/* Progress Indicator */}
              <WizardProgress currentStep={currentStep} />

              {/* Step Custom Form/Grid Content */}
              <View style={styles.stepContent}>{children}</View>

              {/* Wizard Footer Navigation Controls */}
              <View style={styles.footerContainer}>
                {onBack && (
                  <TouchableOpacity
                    onPress={onBack}
                    style={styles.backButton}
                    accessibilityRole="button"
                    accessibilityLabel={currentStep === OnboardingStep.BRAND ? "Cancel onboarding" : "Go back to previous step"}
                  >
                    <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      {currentStep === OnboardingStep.BRAND ? (
                        <Path
                          d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
                          fill="#94A3B8"
                        />
                      ) : (
                        <Path
                          d="M20 11H7.83L13.42 5.42L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z"
                          fill="#94A3B8"
                        />
                      )}
                    </Svg>
                    <Text style={styles.backButtonText}>
                      {currentStep === OnboardingStep.BRAND ? 'Cancel' : 'Back'}
                    </Text>
                  </TouchableOpacity>
                )}

                {onNext && (
                  <View style={[styles.nextButtonWrapper, !onBack && styles.fullWidthButton]}>
                    <PrimaryButton
                      title={nextButtonTitle}
                      onPress={onNext}
                      disabled={isNextDisabled}
                      isLoading={isNextLoading}
                    />
                  </View>
                )}
              </View>

            </Animated.View>
          </SafeAreaView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
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
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  header: {
    marginTop: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: '700',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    maxWidth: '90%',
    lineHeight: 18,
  },
  card: {
    alignSelf: 'stretch',
    backgroundColor: '#141824',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 20,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  topAccentBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topAccentBar: {
    width: '75%',
    height: '100%',
    backgroundColor: '#3B82F6',
    opacity: 0.6,
  },
  stepContent: {
    flex: 1,
    minHeight: 200,
    marginBottom: 20,
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#181D2A',
    gap: 6,
  },
  backButtonText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '700',
    color: '#94A3B8',
  },
  nextButtonWrapper: {
    flex: 1,
  },
  fullWidthButton: {
    width: '100%',
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
});
