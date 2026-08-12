import { TFunction } from 'i18next';
import { JobStage } from '@/types/job';

export interface ProgressStep {
  key: string;
  title: string;
  sublabel: string;
  stages: JobStage[];
}

export const UI_PROGRESS_STEPS: ProgressStep[] = [
  {
    key: 'VALIDATING',
    title: 'Validating Request',
    sublabel: 'Verifying user profile and registration credentials.',
    stages: ['VALIDATING_REQUEST'],
  },
  {
    key: 'RESOLVING_TEMPLATE',
    title: 'Resolving Template',
    sublabel: 'Searching manufacturer database for matching configurations.',
    stages: ['LOOKING_FOR_TEMPLATE'],
  },
  {
    key: 'GENERATING_SPECS',
    title: 'AI Specifications Compilation',
    sublabel: 'Synthesizing parts list, specifications, and service schedules.',
    stages: ['GENERATING_TEMPLATE', 'SAVING_TEMPLATE'],
  },
  {
    key: 'CLONING_TWIN',
    title: 'Initializing Digital Twin',
    sublabel: 'Creating user vehicle instance and maintenance logs.',
    stages: ['CLONING_DIGITAL_TWIN', 'FINALIZING'],
  },
];

export function getLocalizedProgressSteps(t: TFunction): ProgressStep[] {
  return [
    {
      key: 'VALIDATING',
      title: t('garage:ai.step_validating_title', { defaultValue: 'Validating Request' }),
      sublabel: t('garage:ai.step_validating_sublabel', { defaultValue: 'Verifying user profile and registration credentials.' }),
      stages: ['VALIDATING_REQUEST'],
    },
    {
      key: 'RESOLVING_TEMPLATE',
      title: t('garage:ai.step_template_title', { defaultValue: 'Resolving Template' }),
      sublabel: t('garage:ai.step_template_sublabel', { defaultValue: 'Searching manufacturer database for matching configurations.' }),
      stages: ['LOOKING_FOR_TEMPLATE'],
    },
    {
      key: 'GENERATING_SPECS',
      title: t('garage:ai.step_specs_title', { defaultValue: 'AI Specifications Compilation' }),
      sublabel: t('garage:ai.step_specs_sublabel', { defaultValue: 'Synthesizing parts list, specifications, and service schedules.' }),
      stages: ['GENERATING_TEMPLATE', 'SAVING_TEMPLATE'],
    },
    {
      key: 'CLONING_TWIN',
      title: t('garage:ai.step_twin_title', { defaultValue: 'Initializing Digital Twin' }),
      sublabel: t('garage:ai.step_twin_sublabel', { defaultValue: 'Creating user vehicle instance and maintenance logs.' }),
      stages: ['CLONING_DIGITAL_TWIN', 'FINALIZING'],
    },
  ];
}

export function getProgressPercentage(stage: JobStage): number {
  switch (stage) {
    case 'PENDING':
      return 5;
    case 'VALIDATING_REQUEST':
      return 15;
    case 'LOOKING_FOR_TEMPLATE':
      return 30;
    case 'GENERATING_TEMPLATE':
      return 50;
    case 'SAVING_TEMPLATE':
      return 70;
    case 'CLONING_DIGITAL_TWIN':
      return 85;
    case 'FINALIZING':
      return 95;
    case 'COMPLETED':
      return 100;
    case 'FAILED':
    case 'CANCELLED':
    default:
      return 0;
  }
}

export function getStepStatus(
  step: ProgressStep,
  currentStage: JobStage
): 'completed' | 'active' | 'pending' {
  const allStages: JobStage[] = [
    'PENDING',
    'VALIDATING_REQUEST',
    'LOOKING_FOR_TEMPLATE',
    'GENERATING_TEMPLATE',
    'SAVING_TEMPLATE',
    'CLONING_DIGITAL_TWIN',
    'FINALIZING',
    'COMPLETED',
    'FAILED',
    'CANCELLED',
  ];

  const currentIdx = allStages.indexOf(currentStage);

  const stepStageIndices = step.stages.map((s) => allStages.indexOf(s));
  const minStepIdx = Math.min(...stepStageIndices);
  const maxStepIdx = Math.max(...stepStageIndices);

  if (currentStage === 'COMPLETED') {
    return 'completed';
  }

  if (currentStage === 'FAILED' || currentStage === 'CANCELLED') {
    if (currentIdx > maxStepIdx) {
      return 'completed';
    }
    return 'pending';
  }

  if (currentIdx > maxStepIdx) {
    return 'completed';
  }

  if (currentIdx >= minStepIdx && currentIdx <= maxStepIdx) {
    return 'active';
  }

  return 'pending';
}
