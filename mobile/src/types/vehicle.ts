export type MileageUnit = 'KM' | 'MILES';

export type FuelType = 'GASOLINE' | 'DIESEL' | 'ELECTRIC' | 'HYBRID' | 'PLUG_IN_HYBRID' | 'LPG';

export type Transmission = 'MANUAL' | 'AUTOMATIC' | 'CVT' | 'DUAL_CLUTCH';

export type VehicleStatus = 'ACTIVE' | 'SOLD' | 'ARCHIVED';

export enum OnboardingStep {
  BRAND = 'BRAND',
  MODEL = 'MODEL',
  YEAR = 'YEAR',
  TRIM = 'TRIM',
  PURCHASE_CONDITION = 'PURCHASE_CONDITION',
  DETAILS = 'DETAILS',
  COMPONENT_HEALTH = 'COMPONENT_HEALTH',
  CONFIRMATION = 'CONFIRMATION',
}

export type PurchaseCondition = 'BRAND_NEW' | 'USED';

export interface ComponentResponse {
  id: string;
  category: string;
  name: string;
  partNumber?: string;
  specifications?: string;
  lastReplacedMileage?: number;
  lastReplacedDate?: string;
  notes?: string;
  isCustom: boolean;
  isModifiedFromTemplate: boolean;
  canonicalCode?: string;
  
  status?: string;
  healthScore?: number | null;
  confidenceScore?: number;
  estimatedRemainingLife?: number;
  remainingDays?: number | null;
  remainingMileage?: number | null;
  installationMileage?: number | null;
  installationDate?: string | null;
  lastInspectionDate?: string | null;
  origin?: string;
  recommendations?: any[];
}

export type UserComponent = ComponentResponse;

export interface IntervalResponse {
  id: string;
  title: string;
  description?: string;
  intervalMileage?: number;
  intervalMonths?: number;
  isInspectionOnly: boolean;
  isModifiedFromTemplate: boolean;
}

export interface DocumentResponse {
  id: string;
  title: string;
  url: string;
  expiryDate?: string;
  notes?: string;
}

export interface PhotoResponse {
  id: string;
  url: string;
  isMain: boolean;
  uploadedAt: string;
}

export interface VehicleResponse {
  id: string;
  userId: string;
  templateId: string;
  brandName: string;
  modelName: string;
  year: number;
  trimConfiguration: string;
  specifications: Record<string, any>;
  licensePlate?: string;
  vin?: string;
  currentMileage: number;
  mileageUnit: MileageUnit;
  fuelType: FuelType;
  transmission: Transmission;
  color?: string;
  nickname?: string;
  purchaseCondition?: PurchaseCondition;
  isPrimary: boolean;
  status: VehicleStatus;
  lastServiceDate?: string;
  lastServiceMileage?: number;
  components: ComponentResponse[];
  intervals: IntervalResponse[];
  documents: DocumentResponse[];
  photos: PhotoResponse[];

  purchaseDate?: string;
  completenessScore?: number;
  estimatedAnnualMileage?: number;
  drivingProfile?: string;
  climateAssumptions?: string;
}

export interface VehicleSummaryResponse {
  id: string;
  brandName: string;
  modelName: string;
  year: number;
  trimConfiguration: string;
  licensePlate?: string;
  vin?: string;
  currentMileage: number;
  mileageUnit: MileageUnit;
  fuelType: FuelType;
  transmission: Transmission;
  color?: string;
  nickname?: string;
  purchaseCondition?: PurchaseCondition;
  isPrimary: boolean;
  status: VehicleStatus;
  mainPhotoUrl?: string;
  lastServiceDate?: string;
  lastServiceMileage?: number;

  purchaseDate?: string;
  completenessScore?: number;
  estimatedAnnualMileage?: number;
  drivingProfile?: string;
  climateAssumptions?: string;
}

export interface CreateVehicleRequest {
  brandId: string;
  modelId: string;
  year: number;
  trimConfiguration?: string;
  engine?: string;
  transmission?: Transmission;
  fuelType?: FuelType;
  color?: string;
  licensePlate?: string;
  vin?: string;
  currentMileage?: number;
  mileageAtPurchase?: number;
  mileageUnit: MileageUnit;
  isPrimary: boolean;
  purchaseCondition: PurchaseCondition;
  nickname?: string;
  purchaseDate?: string;
  initialComponentHealths?: Record<string, string>;
}

export interface UpdateVehicleRequest {
  color?: string;
  licensePlate?: string;
  vin?: string;
  currentMileage?: number;
  mileageUnit?: MileageUnit;
  fuelType?: FuelType;
  transmission?: Transmission;
  lastServiceDate?: string;
  lastServiceMileage?: number;
  status?: VehicleStatus;
}
