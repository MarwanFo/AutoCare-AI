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
  UI_PROGRESS_STEPS,
  getProgressPercentage,
  getStepStatus,
} from '@/utils/jobProgress';

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
  const [jobId, setJobId] = useState<string | null>(null);
  const [clientRequestId, setClientRequestId] = useState(() => generateUuidV4());
  const hasTriggeredInit = useRef(false);
  const onCompletedCalled = useRef(false);

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
    const activeIndex = UI_PROGRESS_STEPS.findIndex((step) =>
      step.stages.includes(job.currentStage)
    );
    return activeIndex !== -1 ? activeIndex : 0;
  };

  // Build appropriate header title & subtitle
  const getHeaderDetails = () => {
    if (isCompleted) {
      return {
        title: 'Digital Twin Ready',
        subtitle: 'Your vehicle digital twin has been successfully activated with standard factory parameters.',
      };
    }
    if (isCancelled) {
      return {
        title: 'Onboarding Cancelled',
        subtitle: 'The background activation job was stopped. You can retry or exit to the wizard.',
      };
    }
    if (isFailed) {
      return {
        title: 'Activation Failed',
        subtitle: 'An error occurred during Gemini AI compilation or data validation.',
      };
    }
    return {
      title: 'Building Digital Twin',
      subtitle: 'AutoCare AI is parsing manufacturer databases and compiling your digital twin profile.',
    };
  };

  const header = getHeaderDetails();

  const getErrorMessage = () => {
    if (createVehicleMutation.isError) {
      const err: any = createVehicleMutation.error;
      return err.response?.data?.message || err.message || 'Failed to submit onboarding request.';
    }
    if (jobQueryError) {
      return 'Failed to retrieve background job progress.';
    }
    return job?.errorMessage || 'An unexpected error occurred during database resolution.';
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
            <View style={styles.progressLabels}>
              <Text style={styles.progressText}>
                {isCompleted
                  ? '100% Complete'
                  : isFailed
                  ? 'Failed'
                  : isCancelled
                  ? 'Cancelled'
                  : `${Math.round(progress)}% compiled`}
              </Text>
              <Text style={styles.stepIndicatorText}>
                {isCompleted
                  ? 'Finished'
                  : isFailed
                  ? 'Failed'
                  : isCancelled
                  ? 'Cancelled'
                  : `Step ${getActiveStepIndex() + 1} of 4`}
              </Text>
            </View>
          </View>

          {/* Steps list or Error Info */}
          {isFailed || isCancelled ? (
            <View style={styles.errorBannerWrapper}>
              <ErrorBanner message={getErrorMessage()} />
              <View style={styles.errorDetailsContainer}>
                <Text style={styles.errorTitle}>
                  {isCancelled ? 'Job Aborted' : 'Background Execution Error'}
                </Text>
                <Text style={styles.errorMessage}>
                  {isCancelled
                    ? 'This job was explicitly cancelled by the user. You can restart the onboarding process or try again.'
                    : 'The Digital Twin generation failed. This might be due to transient network latency or invalid registration inputs.'}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.stepsContainer}>
              {UI_PROGRESS_STEPS.map((step, index) => {
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
              <View style={styles.buttonRow}>
                <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <PrimaryButton
                    title="Retry Generation"
                    onPress={handleRetry}
                    isLoading={createVehicleMutation.isPending}
                  />
                </View>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleCancelInProgress}
                style={styles.cancelButtonCenter}
                disabled={isCompleted || cancelJobMutation.isPending}
              >
                {cancelJobMutation.isPending ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text
                    style={[
                      styles.cancelButtonText,
                      isCompleted && { opacity: 0.3 },
                    ]}
                  >
                    Cancel Generation
                  </Text>
                )}
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
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
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
    flex: 1,
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
  topAccentBarFailed: {
    backgroundColor: '#ffb4ab',
  },
  topAccentBarSuccess: {
    backgroundColor: '#34c759',
  },
  visualContainer: {
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  pulseContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#abc7ff15',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#abc7ff30',
    borderWidth: 1,
  },
  pulseSuccess: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#34c75915',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#34c75930',
    borderWidth: 1,
  },
  pulseFailed: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ffb4ab15',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#ffb4ab30',
    borderWidth: 1,
  },
  progressBarContainer: {
    marginBottom: 20,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#2e3132',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#abc7ff',
    borderRadius: 3,
  },
  progressBarFillFailed: {
    backgroundColor: '#ffb4ab',
  },
  progressBarFillSuccess: {
    backgroundColor: '#34c759',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#abc7ff',
    fontWeight: '600',
  },
  stepIndicatorText: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#c4c7c8',
  },
  errorBannerWrapper: {
    flex: 1,
    gap: 16,
    justifyContent: 'center',
  },
  errorDetailsContainer: {
    backgroundColor: '#ffb4ab10',
    borderColor: '#ffb4ab20',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  errorTitle: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '700',
    color: '#ffb4ab',
    marginBottom: 6,
  },
  errorMessage: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: '#c4c7c8',
    lineHeight: 18,
  },
  stepsContainer: {
    flex: 1,
    gap: 14,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepRowCompleted: {
    opacity: 1,
  },
  stepRowActive: {
    opacity: 1,
  },
  stepRowPending: {
    opacity: 0.35,
  },
  iconColumn: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  completedCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#abc7ff15',
    borderWidth: 1,
    borderColor: '#abc7ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeDotContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#abc7ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#abc7ff',
  },
  pendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#444748',
  },
  textColumn: {
    flex: 1,
  },
  stepTitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  stepTitleCompleted: {
    color: '#abc7ff',
  },
  stepTitleActive: {
    color: '#ffffff',
  },
  stepTitlePending: {
    color: '#c4c7c8',
  },
  stepSublabel: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#c4c7c8',
    lineHeight: 16,
  },
  stepSublabelCompleted: {
    color: '#8e9192',
  },
  stepSublabelActive: {
    color: '#c4c7c8',
  },
  stepSublabelPending: {
    color: '#8e9192',
  },
  footerContainer: {
    marginTop: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  cancelButton: {
    height: 56,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#444748',
  },
  cancelButtonCenter: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
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
