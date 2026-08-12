import { TFunction } from 'i18next';

/**
 * Resolves component health status enum strings (GOOD, WARNING, CRITICAL, UNKNOWN)
 * to localized user-facing text.
 */
export function resolveComponentStatusLabel(status: string | undefined, t: TFunction): string {
  if (!status) return t('maintenance:status.unknown', { defaultValue: 'Unknown' });
  const normalized = status.toUpperCase();
  switch (normalized) {
    case 'GOOD':
      return t('maintenance:status.good', { defaultValue: 'Good Condition' });
    case 'WARNING':
      return t('maintenance:status.warning', { defaultValue: 'Service Needed Soon' });
    case 'CRITICAL':
      return t('maintenance:status.critical', { defaultValue: 'Critical Wear' });
    case 'UNKNOWN':
    default:
      return t('maintenance:status.unknown', { defaultValue: 'Insufficient Data' });
  }
}

/**
 * Resolves purchase condition enum (BRAND_NEW, USED, PRE_OWNED) to localized label.
 */
export function resolvePurchaseConditionLabel(condition: string | undefined, t: TFunction): string {
  if (!condition) return '';
  const normalized = condition.toUpperCase();
  if (normalized === 'BRAND_NEW') {
    return t('garage:condition.brand_new', { defaultValue: 'Brand New (0 km)' });
  }
  return t('garage:condition.pre_owned', { defaultValue: 'Pre-Owned / Used' });
}

/**
 * Resolves vehicle fuel type enum strings to localized label.
 */
export function resolveFuelTypeLabel(fuelType: string | undefined, t: TFunction): string {
  if (!fuelType) return 'N/A';
  const normalized = fuelType.toUpperCase();
  switch (normalized) {
    case 'GASOLINE':
      return t('garage:fuel.gasoline', { defaultValue: 'Gasoline' });
    case 'DIESEL':
      return t('garage:fuel.diesel', { defaultValue: 'Diesel' });
    case 'ELECTRIC':
      return t('garage:fuel.electric', { defaultValue: 'Electric' });
    case 'HYBRID':
      return t('garage:fuel.hybrid', { defaultValue: 'Hybrid' });
    case 'PLUG_IN_HYBRID':
    case 'PHEV':
      return t('garage:fuel.plug_in_hybrid', { defaultValue: 'Plug-in Hybrid' });
    case 'LPG':
      return t('garage:fuel.lpg', { defaultValue: 'LPG / Gas' });
    default:
      return fuelType;
  }
}

/**
 * Resolves vehicle transmission enum strings to localized label.
 */
export function resolveTransmissionLabel(transmission: string | undefined, t: TFunction): string {
  if (!transmission) return 'N/A';
  const normalized = transmission.toUpperCase();
  switch (normalized) {
    case 'MANUAL':
      return t('garage:transmission.manual', { defaultValue: 'Manual' });
    case 'AUTOMATIC':
      return t('garage:transmission.automatic', { defaultValue: 'Automatic' });
    case 'CVT':
      return t('garage:transmission.cvt', { defaultValue: 'CVT' });
    case 'DUAL_CLUTCH':
    case 'DCT':
      return t('garage:transmission.dual_clutch', { defaultValue: 'Dual-Clutch' });
    default:
      return transmission;
  }
}

/**
 * Resolves AI Digital Twin Generation Job Stages to localized readable descriptions.
 */
export function resolveAiJobStageLabel(stage: string | undefined, t: TFunction): string {
  if (!stage) return t('garage:ai.stage_pending', { defaultValue: 'Initializing Digital Twin...' });
  const normalized = stage.toUpperCase();
  switch (normalized) {
    case 'PENDING':
      return t('garage:ai.stage_pending', { defaultValue: 'Initializing Digital Twin generation...' });
    case 'EXTRACTING_SPECIFICATIONS':
      return t('garage:ai.stage_extracting', { defaultValue: 'Extracting OEM specifications & engine data...' });
    case 'GENERATING_MAINTENANCE_SCHEDULE':
      return t('garage:ai.stage_generating_schedule', { defaultValue: 'Building AI maintenance schedule & interval rules...' });
    case 'BUILDING_DIGITAL_TWIN':
      return t('garage:ai.stage_building_twin', { defaultValue: 'Assembling component wear vectors & Digital Twin...' });
    case 'COMPLETED':
      return t('garage:ai.stage_completed', { defaultValue: 'Digital Twin built successfully!' });
    case 'FAILED':
      return t('garage:ai.stage_failed', { defaultValue: 'Digital Twin generation failed.' });
    default:
      return stage;
  }
}
