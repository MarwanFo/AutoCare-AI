import { create } from 'zustand';
import { FuelType, MileageUnit, Transmission, OnboardingStep, PurchaseCondition } from '@/types/vehicle';

export const ONBOARDING_STEPS = [
  OnboardingStep.BRAND,
  OnboardingStep.MODEL,
  OnboardingStep.YEAR,
  OnboardingStep.TRIM,
  OnboardingStep.PURCHASE_CONDITION,
  OnboardingStep.DETAILS,
  OnboardingStep.COMPONENT_HEALTH,
  OnboardingStep.CONFIRMATION,
];

export interface OnboardingState {
  step: OnboardingStep;
  selectedBrand: { id: string; name: string; logoUrl?: string } | null;
  selectedModel: { id: string; name: string } | null;
  selectedYear: number | null;
  selectedTrim: string;
  isCustomTrim: boolean;
  purchaseCondition: PurchaseCondition | null;
  nickname: string;
  
  // Details
  licensePlate: string;
  vin: string;
  currentMileage: string;
  mileageAtPurchase: string;
  mileageUnit: MileageUnit;
  fuelType: FuelType;
  transmission: Transmission;
  color: string;
  isPrimary: boolean;
  engine: string;
  purchaseDate: string;
  initialComponentHealths: Record<string, string>;

  // Actions
  setStep: (step: OnboardingStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  selectBrand: (brand: { id: string; name: string; logoUrl?: string } | null) => void;
  selectModel: (model: { id: string; name: string } | null) => void;
  selectYear: (year: number | null) => void;
  selectTrim: (trim: string, isCustom?: boolean) => void;
  setPurchaseCondition: (condition: PurchaseCondition) => void;
  updateDetails: (details: Partial<Omit<OnboardingState, 'step' | 'setStep' | 'nextStep' | 'prevStep' | 'selectBrand' | 'selectModel' | 'selectYear' | 'selectTrim' | 'setPurchaseCondition' | 'updateDetails' | 'resetOnboarding'>>) => void;
  updateComponentHealth: (componentKey: string, health: string) => void;
  resetOnboarding: () => void;
}

const initialState = {
  step: OnboardingStep.BRAND,
  selectedBrand: null,
  selectedModel: null,
  selectedYear: null,
  selectedTrim: 'Standard',
  isCustomTrim: false,
  purchaseCondition: null,
  nickname: '',
  licensePlate: '',
  vin: '',
  currentMileage: '',
  mileageAtPurchase: '0',
  mileageUnit: 'KM' as MileageUnit,
  fuelType: 'GASOLINE' as FuelType,
  transmission: 'AUTOMATIC' as Transmission,
  color: '',
  isPrimary: false,
  engine: '',
  purchaseDate: new Date().toISOString().split('T')[0],
  initialComponentHealths: {
    engineOil: 'GOOD',
    coolant: 'GOOD',
    tires: 'GOOD',
    brakePads: 'GOOD',
    battery: 'GOOD',
  },
};

export const useVehicleOnboardingStore = create<OnboardingState>((set) => ({
  ...initialState,
  
  setStep: (step) => set({ step }),
  
  nextStep: () => set((state) => {
    if (state.step === OnboardingStep.DETAILS) {
      return { step: OnboardingStep.CONFIRMATION };
    }
    const currentIndex = ONBOARDING_STEPS.indexOf(state.step);
    if (currentIndex < ONBOARDING_STEPS.length - 1) {
      return { step: ONBOARDING_STEPS[currentIndex + 1] };
    }
    return {};
  }),
  
  prevStep: () => set((state) => {
    if (state.step === OnboardingStep.CONFIRMATION) {
      return { step: OnboardingStep.DETAILS };
    }
    const currentIndex = ONBOARDING_STEPS.indexOf(state.step);
    if (currentIndex > 0) {
      return { step: ONBOARDING_STEPS[currentIndex - 1] };
    }
    return {};
  }),
  
  selectBrand: (brand) => set({ 
    selectedBrand: brand, 
    selectedModel: null, 
    selectedYear: null, 
    selectedTrim: 'Standard',
    isCustomTrim: false,
    purchaseCondition: null
  }),
  
  selectModel: (model) => set({ 
    selectedModel: model, 
    selectedYear: null, 
    selectedTrim: 'Standard',
    isCustomTrim: false 
  }),
  
  selectYear: (year) => set({ selectedYear: year }),
  selectTrim: (trim, isCustom = false) => set({ selectedTrim: trim, isCustomTrim: isCustom }),
  setPurchaseCondition: (purchaseCondition) => set({ purchaseCondition }),
  
  updateDetails: (details) => set((state) => ({ ...state, ...details })),
  
  updateComponentHealth: (componentKey, health) => set((state) => ({
    initialComponentHealths: {
      ...state.initialComponentHealths,
      [componentKey]: health,
    }
  })),
  
  resetOnboarding: () => set(initialState),
}));
