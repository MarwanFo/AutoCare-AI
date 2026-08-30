import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { VehicleSummaryResponse } from '@/types/vehicle';
import { useAppTranslation } from '@/i18n/hooks/useAppTranslation';

interface GarageVehicleCardProps {
  vehicle: VehicleSummaryResponse;
  onPress: () => void;
}

export function GarageVehicleCard({ vehicle, onPress }: GarageVehicleCardProps) {
  const { t } = useAppTranslation('garage');

  const title = vehicle.nickname
    ? vehicle.nickname
    : `${vehicle.year} ${vehicle.brandName} ${vehicle.modelName}`;

  const subtitle = vehicle.nickname
    ? `${vehicle.year} ${vehicle.brandName} ${vehicle.modelName}`
    : vehicle.trimConfiguration || t('garage:vehicle.standard_trim');

  const formatMileage = (val: number) => {
    return val ? val.toLocaleString() : '0';
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={styles.card}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`View details for ${title}`}
    >
      {/* Top Identity & Status Row */}
      <View style={styles.headerRow}>
        <View style={styles.brandTitleContainer}>
          <Text style={styles.titleText} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.subtitleText} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>

        {/* Primary Star or Vehicle Badge */}
        {vehicle.isPrimary ? (
          <View style={styles.primaryBadge}>
            <Svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill="#3B82F6"
              />
            </Svg>
            <Text style={styles.primaryBadgeText}>{t('garage:vehicle.primary')}</Text>
          </View>
        ) : (
          <View style={styles.yearBadge}>
            <Text style={styles.yearBadgeText}>{vehicle.year}</Text>
          </View>
        )}
      </View>

      {/* Middle Spec Grid */}
      <View style={styles.metricsContainer}>
        {/* Metric 1: Odometer */}
        <View style={styles.metricItem}>
          <View style={styles.metricHeader}>
            <Svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.1.8-1.3-4.5-2.7V7z"
                fill="#94A3B8"
              />
            </Svg>
            <Text style={styles.metricLabel}>{t('garage:vehicle.odometer')}</Text>
          </View>
          <Text style={styles.metricValue}>
            {formatMileage(vehicle.currentMileage)}{' '}
            <Text style={styles.metricUnit}>{vehicle.mileageUnit || 'KM'}</Text>
          </Text>
        </View>

        <View style={styles.metricDivider} />

        {/* Metric 2: License Plate */}
        <View style={styles.metricItem}>
          <View style={styles.metricHeader}>
            <Svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <Path
                d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"
                fill="#94A3B8"
              />
            </Svg>
            <Text style={styles.metricLabel}>{t('garage:vehicle.plate')}</Text>
          </View>
          <View style={styles.plateBox}>
            <Text style={styles.plateText} numberOfLines={1}>
              {vehicle.licensePlate || '---'}
            </Text>
          </View>
        </View>

        <View style={styles.metricDivider} />

        {/* Metric 3: Powertrain */}
        <View style={styles.metricItem}>
          <View style={styles.metricHeader}>
            <Svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
                fill="#94A3B8"
              />
            </Svg>
            <Text style={styles.metricLabel}>{t('garage:vehicle.powertrain')}</Text>
          </View>
          <Text style={styles.metricValue} numberOfLines={1}>
            {vehicle.fuelType || 'GASOLINE'}
          </Text>
        </View>
      </View>

      {/* Footer Row: Digital Twin Status & Action Trigger */}
      <View style={styles.footerRow}>
        <View style={styles.twinStatusPill}>
          <View style={styles.statusDotActive} />
          <Text style={styles.twinStatusText}>{t('garage:status.ai_twin_active')}</Text>
        </View>

        <View style={styles.actionTrigger}>
          <Text style={styles.actionText}>{t('garage:vehicle.view_twin')}</Text>
          <Svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <Path
              d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"
              fill="#3B82F6"
            />
          </Svg>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#131722',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 3,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  brandTitleContainer: {
    flex: 1,
    marginRight: 10,
  },
  titleText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  subtitleText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  primaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  primaryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3B82F6',
    letterSpacing: 0.3,
  },
  yearBadge: {
    backgroundColor: '#1C2232',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  yearBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  metricsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181D2A',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  metricItem: {
    flex: 1,
    alignItems: 'flex-start',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  metricUnit: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
  },
  plateBox: {
    backgroundColor: '#0F131C',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  plateText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E2E8F0',
    letterSpacing: 0.5,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginHorizontal: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
  twinStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.10)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  statusDotActive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  twinStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
  },
  actionTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
});
