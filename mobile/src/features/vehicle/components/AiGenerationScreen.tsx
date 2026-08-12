import React, { useEffect, useState, useRef } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { PrimaryButton } from '@/features/auth/components/PrimaryButton';
import { ErrorBanner } from '@/features/auth/components/ErrorBanner';
import { VehicleAiHeader } from './VehicleAiHeader';
import { useCreateVehicle } from '@/hooks/vehicle/useCreateVehicle';
import { useJob } from '@/hooks/job/useJob';
import { useCancelJob } from '@/hooks/job/useCancelJob';
import { CreateVehicleRequest } from '@/types/vehicle';
import {
  getLocalizedProgressSteps,
  getProgressPercentage,
  getStepStatus,
} from '@/utils/jobProgress';
import { useAppTranslation } from '@/i18n/hooks/useAppTranslation';
import { useRTL } from '@/i18n/hooks/useRTL';

function generateUuidV4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const SUCCESS_ANIMATION_DURATION_MS = 2000;

interface AiGenerationScreenProps {
  requestPayload: CreateVehicleRequest;
  onCancel: () => void;
  onCompleted: (vehicleId: string) => void;
}

export function AiGenerationScreen({
  requestPayload,
  onCancel,
  onCompleted,
}: AiGenerationScreenProps) {
  const { t } = useAppTranslation(['garage', 'common', 'errors']);
  const { isRTL } = useRTL();

  const [jobId, setJobId] = useState<string | null>(null);
  const [clientRequestId, setClientRequestId] = useState(() => generateUuidV4());
  const hasTriggeredInit = useRef(false);
  const onCompletedCalled = useRef(false);

  const steps = getLocalizedProgressSteps(t);

  // Mutations & Queries
  const createVehicleMutation = useCreateVehicle();
  const cancelJobMutation = useCancelJob();
  const { data: job, error: jobQueryError } = useJob(jobId);

  // Trigger vehicle onboarding job on mount or retry
  const startGeneration = async (reqId: string) => {
    try {
      setJobId(null);
      const jobResponse = await createVehicleMutation.mutateAsync({
        request: requestPayload,
        clientRequestId: reqId,
      });
      setJobId(jobResponse.id);
    } catch (err) {
      console.error('Failed to initiate digital twin generation:', err);
    }
  };

  useEffect(() => {
    if (!hasTriggeredInit.current) {
      hasTriggeredInit.current = true;
      startGeneration(clientRequestId);
    }
  }, []);

  // Handle post-success redirection delay
  useEffect(() => {
    if (job?.status === 'COMPLETED' && job.result?.vehicleId && !onCompletedCalled.current) {
      onCompletedCalled.current = true;
      const delay = setTimeout(() => {
        onCompleted(job.result!.vehicleId!);
      }, SUCCESS_ANIMATION_DURATION_MS);
      return () => clearTimeout(delay);
    }
  }, [job?.status, job?.result?.vehicleId, onCompleted]);

  // Derive layout progress from current stage
  const progress = job ? getProgressPercentage(job.currentStage) : 5;
  const progressStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(`${progress}%`, { duration: 600 }),
    };
  });

  const handleRetry = () => {
    const newReqId = generateUuidV4();
    setClientRequestId(newReqId);
    onCompletedCalled.current = false;
    startGeneration(newReqId);
  };

  const handleCancelInProgress = async () => {
    if (jobId) {
      try {
        await cancelJobMutation.mutateAsync(jobId);
      } catch (err) {
        console.error('Failed to cancel running job:', err);
      }
    }
    onCancel();
  };

  // Determine current status UI state
  const isFailed = job?.status === 'FAILED' || !!jobQueryError || createVehicleMutation.isError;
  const isCancelled = job?.status === 'CANCELLED';
  const isCompleted = job?.status === 'COMPLETED';

  // Get active step index for UI "Step X of 4" label
  const getActiveStepIndex = () => {
    if (!job) return 0;
    const activeIndex = steps.findIndex((step) =>
      step.stages.includes(job.currentStage)
    );
    return activeIndex !== -1 ? activeIndex : 0;
  };

  // Build appropriate header title & subtitle
  const getHeaderDetails = () => {
    if (isCompleted) {
      return {
        title: t('garage:ai.twin_ready_title', { defaultValue: 'Digital Twin Ready' }),
        subtitle: t('garage:ai.twin_ready_subtitle', { defaultValue: 'Your vehicle digital twin has been successfully activated with standard factory parameters.' }),
      };
    }
    if (isCancelled) {
      return {
        title: t('garage:ai.onboarding_cancelled_title', { defaultValue: 'Onboarding Cancelled' }),
        subtitle: t('garage:ai.onboarding_cancelled_subtitle', { defaultValue: 'The background activation job was stopped. You can retry or exit to the wizard.' }),
      };
    }
    if (isFailed) {
      return {
        title: t('garage:ai.activation_failed_title', { defaultValue: 'Activation Failed' }),
        subtitle: t('garage:ai.activation_failed_subtitle', { defaultValue: 'An error occurred during Gemini AI compilation or data validation.' }),
      };
    }
    return {
      title: t('garage:ai.building_twin_title', { defaultValue: 'Building Digital Twin' }),
      subtitle: t('garage:ai.building_twin_subtitle', { defaultValue: 'AutoCare AI is parsing manufacturer databases and compiling your digital twin profile.' }),
    };
  };

  const header = getHeaderDetails();

  const getErrorMessage = () => {
    if (createVehicleMutation.isError) {
      const err: any = createVehicleMutation.error;
      return err.response?.data?.message || err.message || t('errors:generic', { defaultValue: 'Failed to submit onboarding request.' });
    }
    if (jobQueryError) {
      return t('errors:job_progress_failed', { defaultValue: 'Failed to retrieve background job progress.' });
    }
    return job?.errorMessage || t('errors:generic', { defaultValue: 'An unexpected error occurred during database resolution.' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.topGlow} />
      <View style={styles.bottomGlow} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Header Section */}
        <VehicleAiHeader title={header.title} subtitle={header.subtitle} />

        {/* Central Card */}
        <Animated.View entering={FadeInDown.duration(600)} style={styles.card}>
          <View style={styles.topAccentBarContainer}>
            <View
              style={[
                styles.topAccentBar,
                isFailed && styles.topAccentBarFailed,
                isCancelled && styles.topAccentBarFailed,
                isCompleted && styles.topAccentBarSuccess,
              ]}
            />
          </View>

          {/* Central Visual State */}
          <View style={styles.visualContainer}>
            {isCompleted ? (
              <Animated.View entering={FadeIn} style={styles.pulseSuccess}>
                <Svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                    fill="#34c759"
                  />
                </Svg>
              </Animated.View>
            ) : isFailed || isCancelled ? (
              <Animated.View entering={FadeIn} style={styles.pulseFailed}>
                <Svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                    fill="#ffb4ab"
                  />
                </Svg>
              </Animated.View>
            ) : (
              <View style={styles.pulseContainer}>
                <ActivityIndicator size="large" color="#abc7ff" />
              </View>
            )}
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  (isFailed || isCancelled) && styles.progressBarFillFailed,
                  isCompleted && styles.progressBarFillSuccess,
                  progressStyle,
                ]}
              />
            </View>
            <View style={[styles.progressLabels, isRTL && { flexDirection: 'row-reverse' }]}>
              <Text style={styles.progressText}>
                {isCompleted
                  ? t('garage:ai.complete_100', { defaultValue: '100% Complete' })
                  : isFailed
                  ? t('common:failed', { defaultValue: 'Failed' })
                  : isCancelled
                  ? t('common:cancelled', { defaultValue: 'Cancelled' })
                  : t('garage:ai.compiled_pct', { pct: Math.round(progress), defaultValue: `${Math.round(progress)}% compiled` })}
              </Text>
              <Text style={styles.stepIndicatorText}>
                {isCompleted
                  ? t('common:finished', { defaultValue: 'Finished' })
                  : isFailed
                  ? t('common:failed', { defaultValue: 'Failed' })
                  : isCancelled
                  ? t('common:cancelled', { defaultValue: 'Cancelled' })
                  : t('garage:ai.step_indicator', { current: getActiveStepIndex() + 1, total: 4, defaultValue: `Step ${getActiveStepIndex() + 1} of 4` })}
              </Text>
            </View>
          </View>

          {/* Steps list or Error Info */}
          {isFailed || isCancelled ? (
            <View style={styles.errorBannerWrapper}>
              <ErrorBanner message={getErrorMessage()} />
              <View style={styles.errorDetailsContainer}>
                <Text style={[styles.errorTitle, isRTL && { textAlign: 'right' }]}>
                  {isCancelled
                    ? t('garage:ai.job_aborted', { defaultValue: 'Job Aborted' })
                    : t('garage:ai.exec_error', { defaultValue: 'Background Execution Error' })}
                </Text>
                <Text style={[styles.errorMessage, isRTL && { textAlign: 'right' }]}>
                  {isCancelled
                    ? t('garage:ai.cancelled_msg', { defaultValue: 'This job was explicitly cancelled by the user. You can restart the onboarding process or try again.' })
                    : t('garage:ai.failed_msg', { defaultValue: 'The Digital Twin generation failed. This might be due to transient network latency or invalid registration inputs.' })}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.stepsContainer}>
              {steps.map((step) => {
                const currentStage = job?.currentStage || 'PENDING';
                const status = getStepStatus(step, currentStage);
                const isStepCompleted = status === 'completed';
                const isStepActive = status === 'active';
                const isStepPending = status === 'pending';

                return (
                  <View
                    key={step.key}
                    style={[
                      styles.stepRow,
                      isStepCompleted && styles.stepRowCompleted,
                      isStepActive && styles.stepRowActive,
                      isStepPending && styles.stepRowPending,
                      isRTL && { flexDirection: 'row-reverse' },
                    ]}
                  >
                    <View style={styles.iconColumn}>
                      {isStepCompleted ? (
                        <View style={styles.completedCheck}>
                          <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <Path
                              d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                              fill="#abc7ff"
                            />
                          </Svg>
                        </View>
                      ) : isStepActive ? (
                        <View style={styles.activeDotContainer}>
                          <View style={styles.activeDot} />
                        </View>
                      ) : (
                        <View style={styles.pendingDot} />
                      )}
                    </View>
                    <View style={styles.textColumn}>
                      <Text
                        style={[
                          styles.stepTitle,
                          isStepCompleted && styles.stepTitleCompleted,
                          isStepActive && styles.stepTitleActive,
                          isStepPending && styles.stepTitlePending,
                          isRTL && { textAlign: 'right' },
                        ]}
                      >
                        {step.title}
                      </Text>
                      <Text
                        style={[
                          styles.stepSublabel,
                          isStepCompleted && styles.stepSublabelCompleted,
                          isStepActive && styles.stepSublabelActive,
                          isStepPending && styles.stepSublabelPending,
                          isRTL && { textAlign: 'right' },
                        ]}
                      >
                        {step.sublabel}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Navigation Controls */}
          <View style={styles.footerContainer}>
            {isFailed || isCancelled ? (
              <View style={[styles.buttonRow, isRTL && { flexDirection: 'row-reverse' }]}>
                <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
                  <Text style={styles.cancelButtonText}>{t('common:cancel', { defaultValue: 'Cancel' })}</Text>
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <PrimaryButton
                    title={t('garage:ai.retry_generation', { defaultValue: 'Retry Generation' })}
                    onPress={handleRetry}
                    isLoading={createVehicleMutation.isPending}
                  />
                </View>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleCancelInProgress}
                style={styles.textOnlyCancelButton}
                disabled={isCompleted || cancelJobMutation.isPending}
              >
                <Text style={styles.textOnlyCancelText}>
                  {isCompleted
                    ? t('garage:ai.redirecting', { defaultValue: 'Redirecting to vehicle...' })
                    : t('common:cancel', { defaultValue: 'Cancel Onboarding' })}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131313',
  },
  topGlow: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(171, 199, 255, 0.08)',
  },
  bottomGlow: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(171, 199, 255, 0.05)',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  card: {
    flex: 1,
    backgroundColor: '#1c1c1c',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#2f3131',
    marginTop: 16,
    marginBottom: 16,
    padding: 24,
    overflow: 'hidden',
  },
  topAccentBarContainer: {
    height: 4,
    backgroundColor: '#252525',
    marginHorizontal: -24,
    marginTop: -24,
    marginBottom: 24,
  },
  topAccentBar: {
    height: '100%',
    backgroundColor: '#abc7ff',
  },
  topAccentBarSuccess: {
    backgroundColor: '#34c759',
  },
  topAccentBarFailed: {
    backgroundColor: '#ffb4ab',
  },
  visualContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  pulseContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(171, 199, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(171, 199, 255, 0.2)',
  },
  pulseSuccess: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(52, 199, 89, 0.2)',
  },
  pulseFailed: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 180, 171, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 180, 171, 0.2)',
  },
  progressBarContainer: {
    marginVertical: 16,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#252525',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#abc7ff',
    borderRadius: 4,
  },
  progressBarFillSuccess: {
    backgroundColor: '#34c759',
  },
  progressBarFillFailed: {
    backgroundColor: '#ffb4ab',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    color: '#abc7ff',
  },
  stepIndicatorText: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#8e9192',
  },
  stepsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
    marginVertical: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  stepRowActive: {
    backgroundColor: '#252525',
  },
  stepRowCompleted: {
    opacity: 0.8,
  },
  stepRowPending: {
    opacity: 0.4,
  },
  iconColumn: {
    marginRight: 16,
  },
  completedCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(171, 199, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDotContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(171, 199, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#abc7ff',
  },
  pendingDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#444',
  },
  textColumn: {
    flex: 1,
  },
  stepTitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  stepTitleActive: {
    color: '#abc7ff',
  },
  stepTitleCompleted: {
    color: '#e2e2e2',
  },
  stepTitlePending: {
    color: '#8e9192',
  },
  stepSublabel: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#8e9192',
    marginTop: 2,
  },
  stepSublabelActive: {
    color: '#c4c7c8',
  },
  stepSublabelCompleted: {
    color: '#8e9192',
  },
  stepSublabelPending: {
    color: '#666',
  },
  errorBannerWrapper: {
    flex: 1,
    justifyContent: 'center',
    gap: 12,
  },
  errorDetailsContainer: {
    backgroundColor: '#252525',
    padding: 16,
    borderRadius: 12,
  },
  errorTitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: '#ffb4ab',
    marginBottom: 4,
  },
  errorMessage: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#c4c7c8',
    lineHeight: 18,
  },
  footerContainer: {
    marginTop: 'auto',
    paddingTop: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cancelButton: {
    height: 56,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: '#c4c7c8',
  },
  textOnlyCancelButton: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textOnlyCancelText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#8e9192',
  },
});
