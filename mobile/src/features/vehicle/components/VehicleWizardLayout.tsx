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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
              entering={FadeInDown.duration(500)}
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
                    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      {currentStep === OnboardingStep.BRAND ? (
                        <Path
                          d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
                          fill="#ffffff"
                        />
                      ) : (
                        <Path
                          d="M20 11H7.83L13.42 5.42L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z"
                          fill="#ffffff"
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
    backgroundColor: '#131313',
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
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  header: {
    marginTop: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#c4c7c8',
    textAlign: 'center',
    maxWidth: '85%',
  },
  card: {
    alignSelf: 'stretch',
    backgroundColor: '#201f1f',
    borderWidth: 1,
    borderColor: '#444748',
    borderRadius: 32,
    paddingHorizontal: 20,
    paddingVertical: 24,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
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
    width: '80%',
    height: '100%',
    backgroundColor: '#abc7ff',
    opacity: 0.5,
  },
  stepContent: {
    flex: 1,
    minHeight: 200,
    marginBottom: 24,
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    paddingHorizontal: 20,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#444748',
    backgroundColor: 'transparent',
    gap: 8,
  },
  backButtonText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  nextButtonWrapper: {
    flex: 1,
  },
  fullWidthButton: {
    width: '100%',
  },
  topGlow: {
    position: 'absolute',
    top: '-10%',
    right: '-10%',
    width: '60%',
    aspectRatio: 1,
    borderRadius: 9999,
    backgroundColor: '#abc7ff',
    opacity: 0.04,
    zIndex: 1,
  },
  bottomGlow: {
    position: 'absolute',
    bottom: '-10%',
    left: '-10%',
    width: '50%',
    aspectRatio: 1,
    borderRadius: 9999,
    backgroundColor: '#ffffff',
    opacity: 0.04,
    zIndex: 1,
  },
});
