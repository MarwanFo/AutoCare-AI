import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useVehicle } from '@/hooks/vehicle/useVehicle';
import { useBatchUpdateComponentDates } from '@/hooks/vehicle/useBatchUpdateComponentDates';
import { DatePickerInput } from './DatePickerInput';
import { PrimaryButton } from '@/features/auth/components/PrimaryButton';
import { ErrorBanner } from '@/features/auth/components/ErrorBanner';
import { ComponentResponse } from '@/types/vehicle';
import { useAppTranslation } from '@/i18n/hooks/useAppTranslation';
import { useRTL } from '@/i18n/hooks/useRTL';
import { resolveCategoryLabel, resolveComponentName } from '../utils/componentResolver';

interface PreownedComponentsStepProps {
  vehicleId: string;
  onComplete: () => void;
}

export function PreownedComponentsStep({
  vehicleId,
  onComplete,
}: PreownedComponentsStepProps) {
  const { t } = useAppTranslation(['maintenance', 'common', 'garage', 'errors']);
  const { isRTL } = useRTL();
  const { data: vehicle, isLoading, error } = useVehicle(vehicleId);
  const batchUpdateMutation = useBatchUpdateComponentDates();

  // Map of component name -> ISO date YYYY-MM-DD
  const [componentDates, setComponentDates] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleDateChange = (componentName: string, isoDate: string) => {
    setComponentDates((prev) => {
      const copy = { ...prev };
      if (!isoDate) {
        delete copy[componentName];
      } else {
        copy[componentName] = isoDate;
      }
      return copy;
    });
  };

  const handleSave = async () => {
    setSaveError(null);
    try {
      if (Object.keys(componentDates).length > 0) {
        await batchUpdateMutation.mutateAsync({
          vehicleId,
          componentDates,
        });
      }
      onComplete();
    } catch (err: any) {
      console.error('Failed to save component dates:', err);
      setSaveError(
        err.response?.data?.message || t('errors:generic', { defaultValue: 'Failed to update component maintenance dates.' })
      );
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#abc7ff" />
        <Text style={styles.loadingText}>
          {t('garage:onboarding.loading_components', { defaultValue: 'Loading AI-generated component list...' })}
        </Text>
      </View>
    );
  }

  if (error || !vehicle) {
    return (
      <View style={styles.container}>
        <ErrorBanner message={t('errors:failed_to_load_vehicle', { defaultValue: 'Failed to load generated vehicle component data.' })} />
        <TouchableOpacity style={styles.retryBtn} onPress={onComplete}>
          <Text style={styles.retryBtnText}>{t('common:continue_to_garage', { defaultValue: 'Continue to Garage' })}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const components: ComponentResponse[] = vehicle.components || [];

  return (
    <View style={styles.container}>
      <View style={styles.headerArea}>
        <Text style={[styles.title, isRTL && { textAlign: 'right' }]}>
          {t('maintenance:preowned.title', { defaultValue: 'Component Maintenance History' })}
        </Text>
        <Text style={[styles.subtitle, isRTL && { textAlign: 'right' }]}>
          {t('maintenance:preowned.subtitle', { defaultValue: 'Set the date when each component was last replaced to enable AI health & replacement predictions.' })}
        </Text>
      </View>

      {saveError && <ErrorBanner message={saveError} />}

      <ScrollView style={styles.scrollList} contentContainerStyle={styles.scrollContent}>
        {components.map((comp) => {
          const currentDate = componentDates[comp.name] || '';
          const localizedName = resolveComponentName(comp.name, comp.canonicalCode, comp.isCustom, t);
          const localizedCat = resolveCategoryLabel(comp.category, t);

          return (
            <View key={comp.id || comp.name} style={styles.componentCard}>
              <View style={styles.cardHeader}>
                <View style={[styles.categoryBadge, isRTL && { alignSelf: 'flex-end' }]}>
                  <Text style={styles.categoryText}>{localizedCat || comp.category || 'GENERAL'}</Text>
                </View>
                <Text style={[styles.componentName, isRTL && { textAlign: 'right' }]}>{localizedName}</Text>
                {comp.specifications ? (
                  <Text style={[styles.specsText, isRTL && { textAlign: 'right' }]}>{comp.specifications}</Text>
                ) : null}
              </View>

              <View style={styles.datePickerWrapper}>
                <DatePickerInput
                  label={t('maintenance:form.last_replaced_optional', { defaultValue: 'Last Replaced Date (Optional)' })}
                  value={currentDate}
                  onChange={(isoDate) => handleDateChange(comp.name, isoDate)}
                  placeholder={t('maintenance:form.select_replacement_date', { defaultValue: 'Select replacement date' })}
                />
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={[styles.footer, isRTL && { flexDirection: 'row-reverse' }]}>
        <TouchableOpacity style={styles.skipBtn} onPress={onComplete} disabled={batchUpdateMutation.isPending}>
          <Text style={styles.skipText}>{t('common:skip_for_now', { defaultValue: 'Skip for Now' })}</Text>
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <PrimaryButton
            title={t('maintenance:actions.save_dates', { defaultValue: 'Save Maintenance Dates' })}
            onPress={handleSave}
            isLoading={batchUpdateMutation.isPending}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131313',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  centered: {
    flex: 1,
    backgroundColor: '#131313',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#8e9192',
    fontFamily: 'Inter',
    fontSize: 14,
  },
  headerArea: {
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: '#c4c7c8',
    lineHeight: 18,
  },
  scrollList: {
    flex: 1,
  },
  scrollContent: {
    gap: 16,
    paddingBottom: 16,
  },
  componentCard: {
    backgroundColor: '#1c1c1c',
    borderRadius: 16,
    borderColor: '#2f3131',
    borderWidth: 1,
    padding: 16,
  },
  cardHeader: {
    marginBottom: 12,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#abc7ff15',
    borderColor: '#abc7ff40',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#abc7ff',
    fontFamily: 'Inter',
    textTransform: 'uppercase',
  },
  componentName: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  specsText: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#8e9192',
    marginTop: 2,
  },
  datePickerWrapper: {
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  skipBtn: {
    height: 56,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: '#8e9192',
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: '#abc7ff',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  retryBtnText: {
    color: '#131313',
    fontWeight: '700',
    fontSize: 14,
  },
});
