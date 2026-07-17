export type JobType = 'DIGITAL_TWIN_GENERATION' | 'OCR' | 'DIAGNOSTICS' | 'IMAGE_ANALYSIS' | 'PDF_PARSING';

export type JobStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export type JobStage =
  | 'PENDING'
  | 'VALIDATING_REQUEST'
  | 'LOOKING_FOR_TEMPLATE'
  | 'GENERATING_TEMPLATE'
  | 'SAVING_TEMPLATE'
  | 'CLONING_DIGITAL_TWIN'
  | 'FINALIZING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface JobResult {
  vehicleId?: string;
  [key: string]: any;
}

export interface Job {
  id: string;
  userId: string;
  type: JobType;
  status: JobStatus;
  currentStage: JobStage;
  payload?: Record<string, any>;
  result?: JobResult;
  errorMessage?: string;
  retryCount: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  lastHeartbeatAt?: string;
}

export type JobResponse = Job;
