import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Image } from 'expo-image';
import { useAppTranslation } from '@/i18n/hooks/useAppTranslation';
import { useRTL } from '@/i18n/hooks/useRTL';
import {
  resolveFuelTypeLabel,
  resolvePurchaseConditionLabel,
  resolveTransmissionLabel,
} from '../utils/enumResolver';
import { resolveComponentName } from '../utils/componentResolver';

interface ConfirmationCardProps {
  brandName: string;
  brandLogoUrl?: string;
  modelName: string;
  year: number;
  trim: string;
  mileage: string;
  mileageUnit: 'KM' | 'MILES';
  vin?: string;
  licensePlate?: string;
  color?: string;
  nickname?: string;
  purchaseCondition?: string;
  isPrimary: boolean;
  fuelType?: string;
  transmission?: string;
  purchaseDate?: string;
  initialComponentHealths?: Record<string, string>;
}

function SmallCarIcon() {
  return (
    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <Path
        d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.28 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01ZM6.85 7H17.14L18.22 10.14H5.78L6.85 7ZM19 17H5V13H19V17ZM7.5 16C8.33 16 9 15.33 9 14.5C9 13.67 8.33 13 7.5 13C6.67 13 6 13.67 6 14.5C6 15.33 6.67 16 7.5 16ZM16.5 16C17.33 16 18 15.33 18 14.5C18 13.67 17.33 13 16.5 13C15.67 13 15 13.67 15 14.5C15 15.33 15.67 16 16.5 16Z"
        fill="#abc7ff"
      />
    </Svg>
  );
}

export function ConfirmationCard({
  brandName,
  brandLogoUrl,
  modelName,
  year,
  trim,
  mileage,
  mileageUnit,
  vin,
  licensePlate,
  color,
  nickname,
  purchaseCondition,
  isPrimary,
  fuelType,
  transmission,
  purchaseDate,
  initialComponentHealths,
}: ConfirmationCardProps) {
  const { t } = useAppTranslation(['garage', 'common', 'maintenance']);
  const { isRTL } = useRTL();

  const notProvidedStr = t('common:not_provided', { defaultValue: 'Not Provided' });

  const specRows = [
    { label: t('garage:specs.brand', { defaultValue: 'Brand' }), value: brandName, isBrand: true },
    { label: t('garage:specs.model', { defaultValue: 'Model' }), value: modelName },
    { label: t('garage:specs.year', { defaultValue: 'Year' }), value: year.toString() },
    { label: t('garage:specs.trim', { defaultValue: 'Trim' }), value: trim },
    { label: t('garage:form.nickname', { defaultValue: 'Nickname' }), value: nickname && nickname.trim().length > 0 ? nickname : notProvidedStr, isItalic: !nickname },
    { label: t('garage:form.purchase_condition', { defaultValue: 'Purchase Condition' }), value: resolvePurchaseConditionLabel(purchaseCondition, t) },
    ...(purchaseDate ? [{ label: t('garage:form.purchase_date', { defaultValue: 'Purchase Date' }), value: purchaseDate }] : []),
    { label: t('garage:form.mileage', { defaultValue: 'Mileage' }), value: mileage ? `${mileage} ${mileageUnit}` : `0 ${mileageUnit}` },
    { label: t('garage:form.vin', { defaultValue: 'VIN' }), value: vin && vin.trim().length > 0 ? vin.toUpperCase() : notProvidedStr, isItalic: !vin },
    { label: t('garage:form.license_plate', { defaultValue: 'License Plate' }), value: licensePlate && licensePlate.trim().length > 0 ? licensePlate.toUpperCase() : notProvidedStr, isItalic: !licensePlate },
    { label: t('garage:form.color', { defaultValue: 'Color' }), value: color && color.trim().length > 0 ? color : notProvidedStr, isItalic: !color },
  ];

  return (
    <View style={styles.card}>
      <View style={[styles.header, isRTL && { flexDirection: 'row-reverse' }]}>
        <View style={[styles.badgeContainer, isRTL && { flexDirection: 'row-reverse' }]}>
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM16.59 7.58L10 14.17L7.41 11.59L6 13L10 17L18 9L16.59 7.58Z"
              fill="#abc7ff"
            />
          </Svg>
          <Text style={styles.badgeText}>{t('garage:onboarding.ready_to_create', { defaultValue: 'Ready to Create' })}</Text>
        </View>
        
        {isPrimary && (
          <View style={styles.primaryBadge}>
            <Text style={styles.primaryBadgeText}>{t('garage:onboarding.primary_tag', { defaultValue: 'PRIMARY' })}</Text>
          </View>
        )}
      </View>

      <Text style={[styles.vehicleTitle, isRTL && { textAlign: 'right' }]}>{`${year} ${brandName} ${modelName}`}</Text>
      <Text style={[styles.vehicleSubtitle, isRTL && { textAlign: 'right' }]}>{trim}</Text>

      <View style={styles.divider} />

      <View style={styles.table}>
        {specRows.map((row, index) => (
          <View
            key={row.label}
            style={[
              styles.tableRow,
              isRTL && { flexDirection: 'row-reverse' },
              index === specRows.length - 1 && styles.tableRowLast,
            ]}
          >
            <Text style={[styles.rowLabel, isRTL && { textAlign: 'right' }]}>{row.label}</Text>
            {row.isBrand ? (
              <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 8 }, isRTL && { flexDirection: 'row-reverse' }]}>
                {brandLogoUrl ? (
                  <Image
                    source={{ uri: brandLogoUrl }}
                    style={{ width: 20, height: 20 }}
                    contentFit="contain"
                    cachePolicy="disk"
                  />
                ) : (
                  <SmallCarIcon />
                )}
                <Text
                  style={[
                    styles.rowValue,
                    row.isItalic && styles.italicText,
                    isRTL && { textAlign: 'right' },
                  ]}
                  numberOfLines={1}
                >
                  {row.value}
                </Text>
              </View>
            ) : (
              <Text
                style={[
                  styles.rowValue,
                  row.isItalic && styles.italicText,
                  isRTL && { textAlign: 'right' },
                ]}
                numberOfLines={1}
              >
                {row.value}
              </Text>
            )}
          </View>
        ))}
      </View>

      <View style={styles.infoDivider} />

      {purchaseCondition === 'USED' && initialComponentHealths && (
        <View style={{ marginBottom: 16 }}>
          <Text style={[styles.infoTitle, isRTL && { textAlign: 'right' }, { marginBottom: 8 }]}>
            {t('maintenance:preowned.initial_health_title', { defaultValue: 'Initial Component Health Status' })}
          </Text>
          <View style={{ gap: 8, backgroundColor: '#131313', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#2f313130', marginBottom: 12 }}>
            {[
              { key: 'engineOil', label: resolveComponentName('Engine Oil', 'ENGINE_OIL', false, t) },
              { key: 'brakePads', label: resolveComponentName('Front Brake Pads', 'FRONT_BRAKE_PADS', false, t) },
              { key: 'tires', label: resolveComponentName('All-Season Tires Set', 'ALL_SEASON_TIRES', false, t) },
              { key: 'battery', label: resolveComponentName('12V AGM Battery', 'BATTERY_12V', false, t) },
            ].map((item) => {
              const val = initialComponentHealths[item.key] || 'GOOD';
              return (
                <View key={item.key} style={[{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, isRTL && { flexDirection: 'row-reverse' }]}>
                  <Text style={{ fontFamily: 'Inter', fontSize: 12, color: '#c4c7c8' }}>{item.label}</Text>
                  <Text style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: '700', color: val === 'GOOD' ? '#34c759' : val === 'WARNING' ? '#ff9500' : '#ff3b30' }}>
                    {val}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      <View style={[styles.infoBanner, isRTL && { flexDirection: 'row-reverse' }]}>
        <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
            fill="#abc7ff"
          />
        </Svg>
        <Text style={[styles.infoText, isRTL && { textAlign: 'right' }]}>
          {t('garage:onboarding.ai_digital_twin_notice', { defaultValue: 'AutoCare AI will generate custom maintenance schedules and track component health based on official manufacturer specifications.' })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1c1c1c',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#2f3131',
    padding: 24,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgeText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: '#abc7ff',
  },
  primaryBadge: {
    backgroundColor: 'rgba(171, 199, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(171, 199, 255, 0.3)',
  },
  primaryBadgeText: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '700',
    color: '#abc7ff',
    letterSpacing: 0.5,
  },
  vehicleTitle: {
    fontFamily: 'Inter',
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  vehicleSubtitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#8e9192',
  },
  divider: {
    height: 1,
    backgroundColor: '#2b2d2d',
    marginVertical: 20,
  },
  table: {
    gap: 12,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2b2d2d30',
  },
  tableRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  rowLabel: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: '#8e9192',
  },
  rowValue: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    maxWidth: '60%',
  },
  italicText: {
    fontStyle: 'italic',
    color: '#666666',
    fontWeight: '400',
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#2b2d2d',
    marginVertical: 20,
  },
  infoTitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: 'rgba(171, 199, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(171, 199, 255, 0.15)',
    padding: 16,
  },
  infoText: {
    flex: 1,
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#c4c7c8',
    lineHeight: 18,
  },
});
