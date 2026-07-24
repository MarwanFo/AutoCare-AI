import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { VehicleSummaryResponse } from '@/types/vehicle';

interface GarageVehicleCardProps {
  vehicle: VehicleSummaryResponse;
  onPress: () => void;
}

export function GarageVehicleCard({ vehicle, onPress }: GarageVehicleCardProps) {
  const title = vehicle.nickname
    ? vehicle.nickname
    : `${vehicle.year} ${vehicle.brandName} ${vehicle.modelName}`;

  const subtitle = vehicle.nickname
    ? `${vehicle.year} ${vehicle.brandName} ${vehicle.modelName}`
    : vehicle.trimConfiguration || 'Standard Trim';

  const formatMileage = (val: number) => {
    return val.toLocaleString();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={`View details for ${title}`}
    >
      {/* Header Banner Row */}
      <View style={styles.headerRow}>
        <View style={styles.brandTitleContainer}>
          <Text style={styles.titleText} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.subtitleText} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>

        {/* Primary / Status Pill */}
        {vehicle.isPrimary && (
          <View style={styles.primaryBadge}>
            <Svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill="#abc7ff"
              />
            </Svg>
            <Text style={styles.primaryBadgeText}>PRIMARY</Text>
          </View>
        )}
      </View>

      {/* Middle Spec Metrics */}
      <View style={styles.metricsContainer}>
        {/* Metric 1: Odometer */}
        <View style={styles.metricItem}>
          <View style={styles.metricHeader}>
            <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.1.8-1.3-4.5-2.7V7z"
                fill="#8e9192"
              />
            </Svg>
            <Text style={styles.metricLabel}>Odometer</Text>
          </View>
          <Text style={styles.metricValue}>
            {formatMileage(vehicle.currentMileage)}{' '}
            <Text style={styles.metricUnit}>{vehicle.mileageUnit}</Text>
          </Text>
        </View>

        {/* Divider */}
        <View style={styles.metricDivider} />

        {/* Metric 2: License Plate */}
        <View style={styles.metricItem}>
          <View style={styles.metricHeader}>
            <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <Path
                d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"
                fill="#8e9192"
              />
            </Svg>
            <Text style={styles.metricLabel}>Plate</Text>
          </View>
          <Text style={styles.metricValue} numberOfLines={1}>
            {vehicle.licensePlate || 'Unassigned'}
          </Text>
        </View>

        {/* Divider */}
        <View style={styles.metricDivider} />

        {/* Metric 3: Powertrain */}
        <View style={styles.metricItem}>
          <View style={styles.metricHeader}>
            <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
                fill="#8e9192"
              />
            </Svg>
            <Text style={styles.metricLabel}>Engine / Trans</Text>
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
          <Text style={styles.twinStatusText}>AI Twin Active</Text>
        </View>

        <View style={styles.actionTrigger}>
          <Text style={styles.actionText}>View Twin</Text>
          <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <Path
              d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"
              fill="#abc7ff"
            />
          </Svg>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#18181b',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#27272a',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
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
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: 'Inter',
    marginBottom: 2,
  },
  subtitleText: {
    fontSize: 13,
    color: '#a1a1aa',
    fontFamily: 'Inter',
  },
  primaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#abc7ff18',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#abc7ff40',
  },
  primaryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#abc7ff',
    fontFamily: 'Inter',
    letterSpacing: 0.5,
  },
  metricsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#212225',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
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
    color: '#8e9192',
    fontFamily: 'Inter',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: 'Inter',
  },
  metricUnit: {
    fontSize: 11,
    color: '#a1a1aa',
    fontWeight: '400',
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#3f3f46',
    marginHorizontal: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  twinStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#052e16',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#10b98140',
  },
  statusDotActive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ade80',
  },
  twinStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4ade80',
    fontFamily: 'Inter',
  },
  actionTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#abc7ff',
    fontFamily: 'Inter',
  },
});
