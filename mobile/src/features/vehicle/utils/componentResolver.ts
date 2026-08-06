import { TFunction } from 'i18next';

/**
 * Explicit Alias Map for Standard Vehicle Component Names to Canonical Keys.
 * Strictly prevents unstable key generation from generic normalizeCode algorithms.
 */
const COMPONENT_ALIAS_MAP: Record<string, string> = {
  // Engine Components
  'Engine Timing Chain / Belt': 'ENGINE_TIMING_SYSTEM',
  'Engine Timing Chain': 'ENGINE_TIMING_SYSTEM',
  'Timing Chain': 'ENGINE_TIMING_SYSTEM',
  'Timing Belt': 'ENGINE_TIMING_SYSTEM',
  'Spark Plugs Set': 'SPARK_PLUGS_SET',
  'Spark Plugs': 'SPARK_PLUGS_SET',
  'Engine Oil': 'ENGINE_OIL',
  'Engine Coolant': 'ENGINE_COOLANT',
  'Engine Oil Filter': 'ENGINE_OIL_FILTER',
  'Engine Air Filter': 'ENGINE_AIR_FILTER',

  // Transmission Components
  'Transmission Clutch / Torque Converter': 'TRANSMISSION_CLUTCH',
  'Transmission Clutch': 'TRANSMISSION_CLUTCH',
  'Torque Converter': 'TRANSMISSION_CLUTCH',
  'Transmission Fluid': 'TRANSMISSION_FLUID',

  // Brakes Components
  'Front Brake Pads': 'FRONT_BRAKE_PADS',
  'Rear Brake Pads': 'REAR_BRAKE_PADS',
  'Brake Rotors (Front)': 'FRONT_BRAKE_ROTORS',
  'Brake Rotors (Rear)': 'REAR_BRAKE_ROTORS',
  'Brake Fluid': 'BRAKE_FLUID',

  // Filters & Tires & Battery & Accessories
  'Cabin Air Filter': 'CABIN_AIR_FILTER',
  'Fuel Filter': 'FUEL_FILTER',
  'All-Season Tires Set': 'ALL_SEASON_TIRES',
  'Tires Set': 'ALL_SEASON_TIRES',
  '12V AGM Battery': 'BATTERY_12V',
  '12V Battery': 'BATTERY_12V',
  'Wiper Blades Set': 'WIPER_BLADES',
  'Wiper Blades': 'WIPER_BLADES',
};

/**
 * Centralized Category Enum Translation Resolver.
 * Maps backend ComponentCategory enum (ENGINE, TRANSMISSION, etc.) to active locale translation.
 */
export function resolveCategoryLabel(category: string | undefined, t: TFunction): string {
  if (!category) return '';
  const key = `maintenance:categories.${category}`;
  return t(key, { defaultValue: category });
}

/**
 * Centralized Component Name Translation Resolver.
 * Resolution Priority:
 * 1. If component is custom, return original backend name.
 * 2. If canonicalCode is provided and valid, resolve via i18n.
 * 3. Look up explicit alias map for recognized standard names.
 * 4. Fallback to original backend name for unrecognized or custom components.
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
    if (translated) return translated;
  }

  // 2. Explicit Alias Map Resolution
  const mappedCode = COMPONENT_ALIAS_MAP[name.trim()];
  if (mappedCode) {
    const key = `maintenance:components_list.${mappedCode}`;
    return t(key, { defaultValue: name });
  }

  // 3. Unknown or Custom Component Fallback
  return name;
}
