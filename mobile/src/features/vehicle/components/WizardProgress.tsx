import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { OnboardingStep } from '@/types/vehicle';
import { ONBOARDING_STEPS, useVehicleOnboardingStore } from '@/stores/vehicleOnboardingStore';

interface WizardProgressProps {
  currentStep: OnboardingStep;
}

const STEP_TITLES: Record<OnboardingStep, string> = {
  [OnboardingStep.BRAND]: 'Select Brand',
  [OnboardingStep.MODEL]: 'Select Model',
  [OnboardingStep.YEAR]: 'Select Year',
  [OnboardingStep.TRIM]: 'Select Trim',
  [OnboardingStep.PURCHASE_CONDITION]: 'Purchase Condition',
  [OnboardingStep.DETAILS]: 'Calibration',
  [OnboardingStep.COMPONENT_HEALTH]: 'Component Health',
  [OnboardingStep.CONFIRMATION]: 'Confirm Specifications',
};

export function WizardProgress({ currentStep }: WizardProgressProps) {
  const purchaseCondition = useVehicleOnboardingStore((state) => state.purchaseCondition);
  
  const activeSteps = ONBOARDING_STEPS.filter(step => {
    if (step === OnboardingStep.COMPONENT_HEALTH && purchaseCondition === 'BRAND_NEW') {
      return false;
    }
    return true;
  });

  const currentStepIndex = activeSteps.indexOf(currentStep);
  const currentStepNumber = currentStepIndex + 1;
  const totalSteps = activeSteps.length;

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.stepText}>
          STEP {currentStepNumber} OF {totalSteps}
        </Text>
        <Text style={styles.titleText}>{STEP_TITLES[currentStep]}</Text>
      </View>

      <View style={styles.barContainer}>
        {activeSteps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = step === currentStep;
          const isCompleted = stepNumber < currentStepNumber;

          return (
            <View key={step} style={styles.barSegmentWrapper}>
              <AnimatedSegment
                isActive={isActive}
                isCompleted={isCompleted}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

function AnimatedSegment({ isActive, isCompleted }: { isActive: boolean; isCompleted: boolean }) {
  const animatedStyle = useAnimatedStyle(() => {
    let backgroundColor = '#444748'; // incomplete/inactive
    if (isActive) {
      backgroundColor = '#abc7ff'; // active secondary accent
    } else if (isCompleted) {
      backgroundColor = '#ffffff'; // completed
    }
    
    return {
      backgroundColor: withTiming(backgroundColor, { duration: 300 }),
    };
  });

  return <Animated.View style={[styles.barSegment, animatedStyle]} />;
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    marginBottom: 24,
  },
  textContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  stepText: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '700',
    color: '#abc7ff',
    letterSpacing: 1.5,
  },
  titleText: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  barContainer: {
    flexDirection: 'row',
    height: 4,
    gap: 8,
  },
  barSegmentWrapper: {
    flex: 1,
    height: '100%',
    borderRadius: 2,
    overflow: 'hidden',
  },
  barSegment: {
    flex: 1,
    height: '100%',
    borderRadius: 2,
  },
});
