import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Switch,
} from 'react-native';
import { useVehicleOnboardingStore } from '@/stores/vehicleOnboardingStore';
import { useBrands } from '@/hooks/brand/useBrands';
import { useModels } from '@/hooks/brand/useModels';
import { useCreateVehicle } from '@/hooks/vehicle/useCreateVehicle';
import { VehicleWizardLayout } from '../components/VehicleWizardLayout';
import { BrandCard } from '../components/BrandCard';
import { ModelCard } from '../components/ModelCard';
import { YearPicker } from '../components/YearPicker';
import { TrimCard } from '../components/TrimCard';
import { ConfirmationCard } from '../components/ConfirmationCard';
import { AiGenerationScreen } from '../components/AiGenerationScreen';
import { ErrorBanner } from '@/features/auth/components/ErrorBanner';
import { FloatingInput } from '@/features/auth/components/PasswordInput';
import Svg, { Path } from 'react-native-svg';
import { FuelType, MileageUnit, Transmission, OnboardingStep, PurchaseCondition } from '@/types/vehicle';

const STANDARD_TRIMS = ['Standard', 'Base', 'Sport', 'Luxury', 'Limited'];
const FUEL_TYPES: { label: string; value: FuelType }[] = [
  { label: 'Gasoline', value: 'GASOLINE' },
  { label: 'Diesel', value: 'DIESEL' },
  { label: 'Electric', value: 'ELECTRIC' },
  { label: 'Hybrid', value: 'HYBRID' },
  { label: 'Plug-in Hybrid', value: 'PLUG_IN_HYBRID' },
  { label: 'LPG', value: 'LPG' },
];
const TRANSMISSIONS: { label: string; value: Transmission }[] = [
  { label: 'Manual', value: 'MANUAL' },
  { label: 'Automatic', value: 'AUTOMATIC' },
  { label: 'CVT', value: 'CVT' },
  { label: 'Dual Clutch', value: 'DUAL_CLUTCH' },
];

export function VehicleOnboardingScreen({
  onComplete,
  onCancel,
}: {
  onComplete?: () => void;
  onCancel?: () => void;
}) {
  const store = useVehicleOnboardingStore();
  
  const handleCancel = () => {
    store.resetOnboarding();
    if (onCancel) onCancel();
  };

  const [brandSearch, setBrandSearch] = useState('');
  const [modelSearch, setModelSearch] = useState('');
  const [customTrimInput, setCustomTrimInput] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // React Query hooks
  const { data: brands = [], isLoading: loadingBrands, error: brandsError } = useBrands();
  const { data: models = [], isLoading: loadingModels } = useModels(store.selectedBrand?.id);
  const createVehicleMutation = useCreateVehicle();

  // Search filter brand
  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  // Search filter model
  const filteredModels = models.filter((model) =>
    model.name.toLowerCase().includes(modelSearch.toLowerCase())
  );



  // Details Validation
  const validateDetails = () => {
    const errors: Record<string, string> = {};
    const isBrandNew = store.purchaseCondition === 'BRAND_NEW';
    
    // Mileage (Required for USED, optional for BRAND_NEW)
    if (!isBrandNew) {
      if (!store.currentMileage || store.currentMileage.trim() === '') {
        errors.currentMileage = 'Mileage is required';
      }
    }

    if (store.currentMileage && store.currentMileage.trim() !== '') {
      const mileageNum = parseInt(store.currentMileage, 10);
      if (isNaN(mileageNum) || mileageNum < 0) {
        errors.currentMileage = 'Mileage must be a positive number';
      }
    }

    if (store.purchaseCondition === 'USED' && store.mileageAtPurchase && store.mileageAtPurchase.trim() !== '') {
      const mileageNum = parseInt(store.mileageAtPurchase, 10);
      if (isNaN(mileageNum) || mileageNum < 0) {
        errors.mileageAtPurchase = 'Mileage must be a positive number';
      }
    }

    // Purchase Date (Required for BRAND_NEW, optional for USED)
    if (isBrandNew) {
      if (!store.purchaseDate || store.purchaseDate.trim() === '') {
        errors.purchaseDate = 'Purchase date is required';
      } else {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(store.purchaseDate)) {
          errors.purchaseDate = 'Date must be in YYYY-MM-DD format';
        }
      }
    } else {
      if (store.purchaseDate && store.purchaseDate.trim() !== '') {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(store.purchaseDate)) {
          errors.purchaseDate = 'Date must be in YYYY-MM-DD format';
        }
      }
    }

    // VIN (Optional, but if set must be 17 characters)
    if (store.vin && store.vin.trim().length > 0) {
      if (store.vin.trim().length !== 17) {
        errors.vin = 'VIN must be exactly 17 characters';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step Navigation Controllers
  const handleNext = () => {
    if (store.step === OnboardingStep.BRAND) {
      if (!store.selectedBrand) return;
      store.nextStep();
    } else if (store.step === OnboardingStep.MODEL) {
      if (!store.selectedModel) return;
      store.nextStep();
    } else if (store.step === OnboardingStep.YEAR) {
      if (!store.selectedYear) return;
      store.nextStep();
    } else if (store.step === OnboardingStep.TRIM) {
      if (store.selectedTrim === 'Custom' && customTrimInput.trim() === '') return;
      store.nextStep();
    } else if (store.step === OnboardingStep.PURCHASE_CONDITION) {
      if (!store.purchaseCondition) return;
      store.nextStep();
    } else if (store.step === OnboardingStep.DETAILS) {
      if (validateDetails()) {
        store.nextStep();
      }
    } else if (store.step === OnboardingStep.COMPONENT_HEALTH) {
      store.nextStep();
    } else if (store.step === OnboardingStep.CONFIRMATION) {
      setIsGenerating(true);
    }
  };

  if (isGenerating) {
    const isBrandNew = store.purchaseCondition === 'BRAND_NEW';
    const requestPayload = {
      brandId: store.selectedBrand!.id,
      modelId: store.selectedModel!.id,
      year: store.selectedYear!,
      trimConfiguration: store.selectedTrim,
      color: store.color.trim() !== '' ? store.color : undefined,
      licensePlate: store.licensePlate.trim() !== '' ? store.licensePlate : undefined,
      vin: store.vin.trim() !== '' ? store.vin : undefined,
      currentMileage: store.currentMileage.trim() !== '' ? parseInt(store.currentMileage, 10) : (isBrandNew ? 0 : undefined),
      mileageAtPurchase: store.purchaseCondition === 'USED' && store.mileageAtPurchase.trim() !== '' ? parseInt(store.mileageAtPurchase, 10) : 0,
      mileageUnit: store.mileageUnit,
      isPrimary: store.isPrimary,
      purchaseCondition: store.purchaseCondition!,
      nickname: store.nickname.trim() !== '' ? store.nickname : undefined,
      purchaseDate: store.purchaseDate.trim() !== '' ? store.purchaseDate : undefined,
      initialComponentHealths: store.purchaseCondition === 'USED' ? store.initialComponentHealths : undefined,
    };

    return (
      <AiGenerationScreen
        requestPayload={requestPayload}
        onCancel={() => setIsGenerating(false)}
        onCompleted={(vehicleId) => {
          setIsGenerating(false);
          store.resetOnboarding();
          if (onComplete) onComplete();
        }}
      />
    );
  }

  // UI Helper variables
  const isNextDisabled = () => {
    if (store.step === OnboardingStep.BRAND) return !store.selectedBrand;
    if (store.step === OnboardingStep.MODEL) return !store.selectedModel;
    if (store.step === OnboardingStep.YEAR) return !store.selectedYear;
    if (store.step === OnboardingStep.TRIM) {
      if (store.selectedTrim === 'Custom') {
        return customTrimInput.trim() === '';
      }
      return false;
    }
    if (store.step === OnboardingStep.PURCHASE_CONDITION) return !store.purchaseCondition;
    if (store.step === OnboardingStep.DETAILS) {
      const isBrandNew = store.purchaseCondition === 'BRAND_NEW';
      if (isBrandNew) {
        return !store.purchaseDate || store.purchaseDate.trim() === '';
      } else {
        return !store.currentMileage || store.currentMileage.trim() === '';
      }
    }
    if (store.step === OnboardingStep.COMPONENT_HEALTH) return false;
    return false;
  };

  const getStepTitleAndSubtitle = () => {
    switch (store.step) {
      case OnboardingStep.BRAND:
        return {
          title: 'Choose Brand',
          subtitle: 'Search or select your vehicle manufacturer brand from the list.',
        };
      case OnboardingStep.MODEL:
        return {
          title: 'Choose Model',
          subtitle: `Select your model associated with ${store.selectedBrand?.name || 'your manufacturer'}.`,
        };
      case OnboardingStep.YEAR:
        return {
          title: 'Choose Year',
          subtitle: 'Select the production year of your vehicle.',
        };
      case OnboardingStep.TRIM:
        return {
          title: 'Choose Trim',
          subtitle: 'Select standard manufacturer trim level, or type custom configuration.',
        };
      case OnboardingStep.PURCHASE_CONDITION:
        return {
          title: 'Purchase Condition',
          subtitle: 'Choose how your Digital Twin initialization should calibrate component wear.',
        };
      case OnboardingStep.DETAILS:
        return {
          title: 'Calibration',
          subtitle: store.purchaseCondition === 'BRAND_NEW' 
            ? 'Enter purchase date, optional odometer readings, and identification details.'
            : 'Enter odometer readings, optional identification, and personalization details.',
        };
      case OnboardingStep.COMPONENT_HEALTH:
        return {
          title: 'Component Health',
          subtitle: 'Assess the current health of 5 critical components to calibrate the Digital Twin.',
        };
      case OnboardingStep.CONFIRMATION:
        return {
          title: 'Verify & Confirm',
          subtitle: 'Verify your digital twin profile details before building your twin.',
        };
      default:
        return { title: 'Add Vehicle', subtitle: '' };
    }
  };

  const { title, subtitle } = getStepTitleAndSubtitle();

  return (
    <VehicleWizardLayout
      currentStep={store.step}
      title={title}
      subtitle={subtitle}
      onBack={store.step !== OnboardingStep.BRAND ? store.prevStep : (onCancel ? handleCancel : undefined)}
      onNext={handleNext}
      isNextDisabled={isNextDisabled()}
      nextButtonTitle={store.step === OnboardingStep.CONFIRMATION ? 'Create Vehicle' : 'Continue'}
      isNextLoading={createVehicleMutation.isPending}
    >
      {/* ERROR BANNER FOR CREATE FAILURES */}
      {serverError && <ErrorBanner message={serverError} />}

      {/* STEP 1: CHOOSE BRAND */}
      {store.step === OnboardingStep.BRAND && (
        <View style={styles.stepContainer}>
          {/* Search bar */}
          <View style={styles.searchBar}>
            <View style={styles.searchIcon}>
              <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                  fill="#8e9192"
                />
              </Svg>
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search manufacturers..."
              placeholderTextColor="#8e9192"
              value={brandSearch}
              onChangeText={setBrandSearch}
            />
          </View>



          {/* Brands list */}
          {loadingBrands ? (
            <ActivityIndicator size="large" color="#abc7ff" style={styles.loading} />
          ) : brandsError ? (
            <Text style={styles.errorText}>Failed to load brands.</Text>
          ) : (
            <FlatList
              data={filteredBrands}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.brandGridWrapper}
              renderItem={({ item: brand }) => (
                <BrandCard
                  name={brand.name}
                  logoUrl={brand.logoUrl}
                  isSelected={store.selectedBrand?.id === brand.id}
                  onPress={() => store.selectBrand(brand)}
                />
              )}
              style={styles.list}
              scrollEnabled={false}
            />
          )}
        </View>
      )}

      {/* STEP 2: CHOOSE MODEL */}
      {store.step === OnboardingStep.MODEL && (
        <View style={styles.stepContainer}>
          <View style={styles.searchBar}>
            <View style={styles.searchIcon}>
              <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                  fill="#8e9192"
                />
              </Svg>
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder={`Search ${store.selectedBrand?.name} models...`}
              placeholderTextColor="#8e9192"
              value={modelSearch}
              onChangeText={setModelSearch}
            />
          </View>

          {loadingModels ? (
            <ActivityIndicator size="large" color="#abc7ff" style={styles.loading} />
          ) : filteredModels.length === 0 ? (
            <Text style={styles.noModelsText}>No matching models found.</Text>
          ) : (
            <FlatList
              data={filteredModels}
              keyExtractor={(item) => item.id}
              renderItem={({ item: model }) => (
                <ModelCard
                  name={model.name}
                  isSelected={store.selectedModel?.id === model.id}
                  onPress={() => store.selectModel(model)}
                />
              )}
              style={styles.list}
              scrollEnabled={false}
            />
          )}
        </View>
      )}

      {/* STEP 3: CHOOSE YEAR */}
      {store.step === OnboardingStep.YEAR && (
        <View style={styles.stepContainer}>
          <YearPicker
            selectedYear={store.selectedYear}
            onSelectYear={(year) => {
              store.selectYear(year);
              setTimeout(() => {
                store.nextStep();
              }, 200);
            }}
          />
        </View>
      )}

      {/* STEP 4: CHOOSE TRIM */}
      {store.step === OnboardingStep.TRIM && (
        <View style={styles.stepContainer}>
          <FlatList
            data={STANDARD_TRIMS}
            keyExtractor={(item) => item}
            renderItem={({ item: trim }) => (
              <TrimCard
                name={trim}
                isSelected={store.selectedTrim === trim && !store.isCustomTrim}
                onPress={() => {
                  store.selectTrim(trim);
                  setCustomTrimInput('');
                }}
              />
            )}
            style={styles.list}
            scrollEnabled={false}
          />

          <TrimCard
            name="Custom Configuration"
            isSelected={store.isCustomTrim}
            onPress={() => {
              store.selectTrim('', true);
            }}
          />

          {store.isCustomTrim && (
            <FloatingInput
              label="Enter Custom Trim"
              value={customTrimInput}
              onChangeText={(text) => {
                setCustomTrimInput(text);
                store.selectTrim(text, true);
              }}
              prefixIcon={
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                    fill="#abc7ff"
                  />
                </Svg>
              }
            />
          )}
        </View>
      )}

      {/* STEP 5: PURCHASE CONDITION */}
      {store.step === OnboardingStep.PURCHASE_CONDITION && (
        <View style={styles.stepContainer}>
          <TouchableOpacity
            style={[
              styles.conditionCard,
              store.purchaseCondition === 'BRAND_NEW' && styles.conditionCardActive,
            ]}
            onPress={() => store.setPurchaseCondition('BRAND_NEW')}
          >
            <View style={styles.conditionHeader}>
              <View style={[styles.conditionIconWrapper, store.purchaseCondition === 'BRAND_NEW' && styles.conditionIconWrapperActive]}>
                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 2L14.85 8.15L21.5 9.12L16.7 13.8L17.83 20.42L12 17.27L6.17 20.42L7.3 13.8L2.5 9.12L9.15 8.15L12 2Z"
                    fill={store.purchaseCondition === 'BRAND_NEW' ? '#131313' : '#abc7ff'}
                  />
                </Svg>
              </View>
              <View style={styles.conditionTitleContainer}>
                <Text style={styles.conditionTitle}>Brand New</Text>
                <Text style={styles.conditionDescription}>
                  Pristine factory condition. Every component starts at 100% health and maintenance intervals start at 0.
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.conditionCard,
              store.purchaseCondition === 'USED' && styles.conditionCardActive,
            ]}
            onPress={() => store.setPurchaseCondition('USED')}
          >
            <View style={styles.conditionHeader}>
              <View style={[styles.conditionIconWrapper, store.purchaseCondition === 'USED' && styles.conditionIconWrapperActive]}>
                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM16.59 7.58L10 14.17L7.41 11.59L6 13L10 17L18 9L16.59 7.58Z"
                    fill={store.purchaseCondition === 'USED' ? '#131313' : '#abc7ff'}
                  />
                </Svg>
              </View>
              <View style={styles.conditionTitleContainer}>
                <Text style={styles.conditionTitle}>Used / Pre-Owned</Text>
                <Text style={styles.conditionDescription}>
                  Starts in verification mode. Component health is set to 'Unknown' and will calibrate over time.
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* STEP 6: CALIBRATION & DETAILS */}
      {store.step === OnboardingStep.DETAILS && (
        <ScrollView style={styles.detailsScroll} scrollEnabled={true}>
          {/* Purchase Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.groupLabel}>Purchase Info</Text>
            <FloatingInput
              label={store.purchaseCondition === 'BRAND_NEW' ? "Purchase Date (YYYY-MM-DD)" : "Purchase Date (YYYY-MM-DD, Optional)"}
              value={store.purchaseDate}
              onChangeText={(val) => {
                store.updateDetails({ purchaseDate: val });
                if (formErrors.purchaseDate) {
                  setFormErrors((prev) => {
                    const copy = { ...prev };
                    delete copy.purchaseDate;
                    return copy;
                  });
                }
              }}
              error={formErrors.purchaseDate}
              prefixIcon={
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"
                    fill="#c4c7c8"
                  />
                </Svg>
              }
            />
          </View>

          {/* Vehicle Nickname */}
          <View style={styles.inputGroup}>
            <Text style={styles.groupLabel}>Personalization</Text>
            <FloatingInput
              label="Vehicle Nickname (e.g. My Daily, Optional)"
              value={store.nickname}
              onChangeText={(val) => store.updateDetails({ nickname: val })}
              prefixIcon={
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                    fill="#c4c7c8"
                  />
                </Svg>
              }
            />
          </View>

          {/* Mileage & Unit Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.groupLabel}>Odometer Specs</Text>
            <View style={styles.mileageContainer}>
              <View style={{ flex: 1 }}>
                <FloatingInput
                  label={store.purchaseCondition === 'BRAND_NEW' ? "Current Mileage (Optional, defaults to 0)" : "Current Mileage"}
                  value={store.currentMileage}
                  onChangeText={(val) => {
                    store.updateDetails({ currentMileage: val });
                    if (formErrors.currentMileage) {
                      setFormErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.currentMileage;
                        return copy;
                      });
                    }
                  }}
                  keyboardType="numeric"
                  error={formErrors.currentMileage}
                  prefixIcon={
                    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 16H11V11H13V18zm0-9H11V7H13V9z"
                        fill="#c4c7c8"
                      />
                    </Svg>
                  }
                />
              </View>
              <View style={styles.unitSelector}>
                <TouchableOpacity
                  onPress={() => store.updateDetails({ mileageUnit: 'KM' })}
                  style={[
                    styles.unitPill,
                    store.mileageUnit === 'KM' && styles.unitPillActive,
                  ]}
                >
                  <Text style={[styles.unitPillText, store.mileageUnit === 'KM' && styles.unitPillTextActive]}>KM</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => store.updateDetails({ mileageUnit: 'MILES' })}
                  style={[
                    styles.unitPill,
                    store.mileageUnit === 'MILES' && styles.unitPillActive,
                  ]}
                >
                  <Text style={[styles.unitPillText, store.mileageUnit === 'MILES' && styles.unitPillTextActive]}>MILES</Text>
                </TouchableOpacity>
              </View>
            </View>

            {store.purchaseCondition === 'USED' && (
              <View style={{ marginTop: 12 }}>
                <FloatingInput
                  label="Mileage at Purchase (Optional, defaults to 0)"
                  value={store.mileageAtPurchase}
                  onChangeText={(val) => {
                    store.updateDetails({ mileageAtPurchase: val });
                    if (formErrors.mileageAtPurchase) {
                      setFormErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.mileageAtPurchase;
                        return copy;
                      });
                    }
                  }}
                  keyboardType="numeric"
                  error={formErrors.mileageAtPurchase}
                  prefixIcon={
                    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 16H11V11H13V18zm0-9H11V7H13V9z"
                        fill="#c4c7c8"
                      />
                    </Svg>
                  }
                />
              </View>
            )}
          </View>

          {/* Registration Info */}
          <View style={styles.inputGroup}>
            <Text style={styles.groupLabel}>Identification & Customization</Text>
            <FloatingInput
              label="VIN (17 Characters, Optional)"
              value={store.vin}
              onChangeText={(val) => {
                store.updateDetails({ vin: val });
                if (formErrors.vin) {
                  setFormErrors((prev) => {
                    const copy = { ...prev };
                    delete copy.vin;
                    return copy;
                  });
                }
              }}
              autoCapitalize="characters"
              maxLength={17}
              error={formErrors.vin}
              prefixIcon={
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
                    fill="#c4c7c8"
                  />
                </Svg>
              }
            />

            <FloatingInput
              label="License Plate (Optional)"
              value={store.licensePlate}
              onChangeText={(val) => store.updateDetails({ licensePlate: val })}
              autoCapitalize="characters"
              prefixIcon={
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2z"
                    fill="#c4c7c8"
                  />
                </Svg>
              }
            />

            <FloatingInput
              label="Exterior Color (Optional)"
              value={store.color}
              onChangeText={(val) => store.updateDetails({ color: val })}
              prefixIcon={
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 3a9 9 0 0 0 0 18 9 9 0 0 0 9-9 9.01 9.01 0 0 0-9-9zm-1 3a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0zm-3 4A1.5 1.5 0 1 1 9.5 9 1.5 1.5 0 0 1 8 10zm3 8H9v-2h2v2zm5-4h-2v-2h2v2zm1-3a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0z"
                    fill="#c4c7c8"
                  />
                </Svg>
              }
            />
          </View>

          {/* Primary switch */}
          <View style={styles.primarySwitchContainer}>
            <View style={{ flex: 1, marginRight: 16 }}>
              <Text style={styles.switchLabel}>Set as Primary Vehicle</Text>
              <Text style={styles.switchSublabel}>Makes this the default vehicle shown on dashboard</Text>
            </View>
            <Switch
              value={store.isPrimary}
              onValueChange={(val) => store.updateDetails({ isPrimary: val })}
              thumbColor={store.isPrimary ? '#abc7ff' : '#444748'}
              trackColor={{ false: '#2a2a2a', true: '#abc7ff50' }}
            />
          </View>
        </ScrollView>
      )}

      {/* STEP: COMPONENT HEALTH */}
      {store.step === OnboardingStep.COMPONENT_HEALTH && (
        <ScrollView style={styles.detailsScroll} scrollEnabled={true}>
          <Text style={styles.healthIntroText}>
            Assess the current health of these 5 critical components to calibrate the Digital Twin:
          </Text>

          {[
            { key: 'engineOil', label: 'Engine Oil', desc: 'Lubrication quality and level' },
            { key: 'coolant', label: 'Coolant', desc: 'Engine temperature regulation fluid' },
            { key: 'tires', label: 'Tires', desc: 'Tread depth and structural integrity' },
            { key: 'brakePads', label: 'Brake Pads', desc: 'Friction material thickness' },
            { key: 'battery', label: '12V Battery', desc: 'Voltage level and starting power' },
          ].map((item) => {
            const currentVal = store.initialComponentHealths[item.key] || 'GOOD';
            return (
              <View key={item.key} style={styles.healthRow}>
                <View style={styles.healthHeaderContainer}>
                  <Text style={styles.healthLabel}>{item.label}</Text>
                  <Text style={styles.healthDesc}>{item.desc}</Text>
                </View>
                <View style={styles.healthButtonsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.healthBtn,
                      currentVal === 'GOOD' && styles.healthBtnGoodActive,
                    ]}
                    onPress={() => store.updateComponentHealth(item.key, 'GOOD')}
                  >
                    <Text style={[styles.healthBtnText, currentVal === 'GOOD' && styles.healthBtnTextGoodActive]}>GOOD</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.healthBtn,
                      currentVal === 'NEEDING_ATTENTION' && styles.healthBtnWarningActive,
                    ]}
                    onPress={() => store.updateComponentHealth(item.key, 'NEEDING_ATTENTION')}
                  >
                    <Text style={[styles.healthBtnText, currentVal === 'NEEDING_ATTENTION' && styles.healthBtnTextWarningActive]}>ATTENTION</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.healthBtn,
                      currentVal === 'CRITICAL' && styles.healthBtnCriticalActive,
                    ]}
                    onPress={() => store.updateComponentHealth(item.key, 'CRITICAL')}
                  >
                    <Text style={[styles.healthBtnText, currentVal === 'CRITICAL' && styles.healthBtnTextCriticalActive]}>CRITICAL</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* STEP 7: VERIFY & CONFIRM */}
      {store.step === OnboardingStep.CONFIRMATION && (
        <View style={styles.stepContainer}>
          <ConfirmationCard
            brandName={store.selectedBrand!.name}
            brandLogoUrl={store.selectedBrand?.logoUrl}
            modelName={store.selectedModel!.name}
            year={store.selectedYear!}
            trim={store.selectedTrim}
            mileage={store.currentMileage}
            mileageUnit={store.mileageUnit}
            vin={store.vin}
            licensePlate={store.licensePlate}
            color={store.color}
            nickname={store.nickname}
            purchaseCondition={store.purchaseCondition!}
            isPrimary={store.isPrimary}
            purchaseDate={store.purchaseDate.trim() !== '' ? store.purchaseDate : undefined}
            initialComponentHealths={store.initialComponentHealths}
          />
        </View>
      )}
    </VehicleWizardLayout>
  );
}

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131313',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2f3131',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter',
    fontSize: 16,
    color: '#ffffff',
    height: '100%',
    padding: 0,
  },

  list: {
    marginTop: 8,
  },
  loading: {
    marginTop: 40,
    alignSelf: 'center',
  },
  errorText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#ffb4ab',
    textAlign: 'center',
    marginTop: 20,
  },
  brandGridWrapper: {
    gap: 12,
  },
  noModelsText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#c4c7c8',
    textAlign: 'center',
    marginTop: 40,
  },
  detailsScroll: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  groupLabel: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700',
    color: '#abc7ff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  mileageContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  unitSelector: {
    flexDirection: 'row',
    backgroundColor: '#131313',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2f3131',
    height: 64,
    padding: 4,
    alignItems: 'center',
  },
  unitPill: {
    height: '100%',
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  unitPillActive: {
    backgroundColor: '#2e3132',
  },
  unitPillText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '700',
    color: '#c4c7c8',
  },
  unitPillTextActive: {
    color: '#ffffff',
  },
  selectorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectorButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#131313',
    borderColor: '#2f3131',
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorButtonActive: {
    borderColor: '#abc7ff',
    backgroundColor: '#1b2333',
  },
  selectorText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: '#c4c7c8',
  },
  selectorTextActive: {
    color: '#ffffff',
  },
  primarySwitchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1c1c',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2f3131',
    padding: 16,
    marginTop: 8,
    marginBottom: 32,
  },
  switchLabel: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  switchSublabel: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#c4c7c8',
  },
  conditionCard: {
    backgroundColor: '#131313',
    borderColor: '#2f3131',
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    alignSelf: 'stretch',
  },
  conditionCardActive: {
    borderColor: '#abc7ff',
    backgroundColor: '#1b2333',
  },
  conditionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  conditionIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2e313250',
    alignItems: 'center',
    justifyContent: 'center',
  },
  conditionIconWrapperActive: {
    backgroundColor: '#abc7ff',
  },
  conditionTitleContainer: {
    flex: 1,
  },
  conditionTitle: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
  },
  conditionDescription: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: '#c4c7c8',
    lineHeight: 18,
  },
  healthIntroText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#c4c7c8',
    marginBottom: 20,
    lineHeight: 20,
  },
  healthRow: {
    backgroundColor: '#1c1c1c',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2f3131',
    padding: 16,
    marginBottom: 16,
  },
  healthHeaderContainer: {
    marginBottom: 12,
  },
  healthLabel: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  healthDesc: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#c4c7c8',
    marginTop: 2,
  },
  healthButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  healthBtn: {
    flex: 1,
    backgroundColor: '#131313',
    borderColor: '#2f3131',
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthBtnGoodActive: {
    borderColor: '#4caf50',
    backgroundColor: '#1b3a24',
  },
  healthBtnWarningActive: {
    borderColor: '#ff9800',
    backgroundColor: '#3d2600',
  },
  healthBtnCriticalActive: {
    borderColor: '#f44336',
    backgroundColor: '#3d1614',
  },
  healthBtnText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700',
    color: '#c4c7c8',
  },
  healthBtnTextGoodActive: {
    color: '#4caf50',
  },
  healthBtnTextWarningActive: {
    color: '#ff9800',
  },
  healthBtnTextCriticalActive: {
    color: '#f44336',
  },
});
