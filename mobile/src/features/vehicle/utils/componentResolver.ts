import { TFunction } from 'i18next';

/**
 * Explicit Alias Map for Standard Vehicle Component Names to Canonical Keys.
 * Prevents raw English string leakages across non-English locales.
 */
const COMPONENT_ALIAS_MAP: Record<string, string> = {
  // Engine & Fluids
  'Engine Timing Chain / Belt': 'ENGINE_TIMING_SYSTEM',
  'Engine Timing Chain': 'ENGINE_TIMING_SYSTEM',
  'Timing Chain': 'ENGINE_TIMING_SYSTEM',
  'Timing Belt': 'ENGINE_TIMING_SYSTEM',
  'Spark Plugs Set': 'SPARK_PLUGS_SET',
  'Spark Plugs': 'SPARK_PLUGS_SET',
  'Engine Oil': 'ENGINE_OIL',
  'Engine Coolant': 'ENGINE_COOLANT',
  'Coolant': 'ENGINE_COOLANT',
  'Engine Oil Filter': 'ENGINE_OIL_FILTER',
  'Oil Filter': 'ENGINE_OIL_FILTER',
  'Engine Air Filter': 'ENGINE_AIR_FILTER',
  'Air Filter': 'ENGINE_AIR_FILTER',

  // Transmission
  'Transmission Clutch / Torque Converter': 'TRANSMISSION_CLUTCH',
  'Transmission Clutch': 'TRANSMISSION_CLUTCH',
  'Torque Converter': 'TRANSMISSION_CLUTCH',
  'Transmission Fluid': 'TRANSMISSION_FLUID',

  // Brakes
  'Front Brake Pads': 'FRONT_BRAKE_PADS',
  'Rear Brake Pads': 'REAR_BRAKE_PADS',
  'Brake Pads': 'FRONT_BRAKE_PADS',
  'Brake Rotors (Front)': 'FRONT_BRAKE_ROTORS',
  'Brake Rotors (Rear)': 'REAR_BRAKE_ROTORS',
  'Brake Rotors': 'FRONT_BRAKE_ROTORS',
  'Brake Fluid': 'BRAKE_FLUID',

  // Filters & Electrical & Tires
  'Cabin Air Filter': 'CABIN_AIR_FILTER',
  'Fuel Filter': 'FUEL_FILTER',
  'All-Season Tires Set': 'ALL_SEASON_TIRES',
  'Tires Set': 'ALL_SEASON_TIRES',
  'Tires': 'ALL_SEASON_TIRES',
  '12V AGM Battery': 'BATTERY_12V',
  '12V Battery': 'BATTERY_12V',
  'Car Battery': 'BATTERY_12V',
  'Battery': 'BATTERY_12V',
  'Wiper Blades Set': 'WIPER_BLADES',
  'Wiper Blades': 'WIPER_BLADES',
};

/**
 * Centralized Category Enum Translation Resolver.
 */
export function resolveCategoryLabel(category: string | undefined, t: TFunction): string {
  if (!category) return '';
  const key = `maintenance:categories.${category.toUpperCase()}`;
  return t(key, { defaultValue: category });
}

/**
 * Centralized Component Name Translation Resolver.
 */
export function resolveComponentName(
  name: string | undefined,
  canonicalCode?: string,
  isCustom?: boolean,
  t?: TFunction
): string {
  if (!name) return '';
  if (isCustom || !t) return name;

  // 1. Direct Canonical Code Resolution
  if (canonicalCode) {
    const key = `maintenance:components_list.${canonicalCode}`;
    const translated = t(key, { defaultValue: '' });
    if (translated && translated !== key) return translated;
  }

  // 2. Direct Code match if name is formatted as code (e.g. "ENGINE_OIL")
  if (name.includes('_') || name === name.toUpperCase()) {
    const key = `maintenance:components_list.${name.trim()}`;
    const translated = t(key, { defaultValue: '' });
    if (translated && translated !== key) return translated;
  }

  // 3. Explicit Alias Map Resolution
  const mappedCode = COMPONENT_ALIAS_MAP[name.trim()];
  if (mappedCode) {
    const key = `maintenance:components_list.${mappedCode}`;
    const translated = t(key, { defaultValue: '' });
    if (translated && translated !== key) return translated;
  }

  // 4. Fallback to original name
  return name;
}
