export type PackType = 'SUBSCRIPTION' | 'CREDIT_PACK';
export type BillingPeriod = 'MONTHLY' | 'ANNUAL' | 'ONE_TIME';

export interface PricingPack {
  id: string;
  code: string;
  name: string;
  description?: string;
  packType: PackType;
  price: number;
  currency: string;
  billingPeriod?: BillingPeriod;
  vehicleLimit: number;
  aiCredits: number;
  features: string | string[];
  badge?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt?: string;
  lastModifiedAt?: string;
}

export interface UserMembershipStatus {
  currentPack: PricingPack;
  aiCredits: number;
  vehiclesCount: number;
  vehicleLimit: number;
  status: string;
  startedAt?: string;
  expiresAt?: string | null;
  autoRenew: boolean;
}
