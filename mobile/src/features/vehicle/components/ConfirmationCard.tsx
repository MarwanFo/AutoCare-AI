import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Image } from 'expo-image';

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
  const specRows = [
    { label: 'Brand', value: brandName, isBrand: true },
    { label: 'Model', value: modelName },
    { label: 'Year', value: year.toString() },
    { label: 'Trim', value: trim },
    { label: 'Nickname', value: nickname && nickname.trim().length > 0 ? nickname : 'Not Provided', isItalic: !nickname },
    { label: 'Purchase Condition', value: purchaseCondition === 'BRAND_NEW' ? 'Brand New' : 'Used' },
    ...(purchaseCondition === 'BRAND_NEW' && purchaseDate ? [{ label: 'Purchase Date', value: purchaseDate }] : []),
    ...(purchaseCondition === 'USED' && purchaseDate ? [{ label: 'Purchase Date', value: purchaseDate }] : []),
    { label: 'Mileage', value: mileage ? `${mileage} ${mileageUnit}` : `0 ${mileageUnit}` },
    { label: 'VIN', value: vin && vin.trim().length > 0 ? vin.toUpperCase() : 'Not Provided', isItalic: !vin },
    { label: 'License Plate', value: licensePlate && licensePlate.trim().length > 0 ? licensePlate.toUpperCase() : 'Not Provided', isItalic: !licensePlate },
    { label: 'Color', value: color && color.trim().length > 0 ? color : 'Not Provided', isItalic: !color },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.badgeContainer}>
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM16.59 7.58L10 14.17L7.41 11.59L6 13L10 17L18 9L16.59 7.58Z"
              fill="#abc7ff"
            />
          </Svg>
          <Text style={styles.badgeText}>Ready to Create</Text>
        </View>
        
        {isPrimary && (
          <View style={styles.primaryBadge}>
            <Text style={styles.primaryBadgeText}>PRIMARY</Text>
          </View>
        )}
      </View>

      <Text style={styles.vehicleTitle}>{`${year} ${brandName} ${modelName}`}</Text>
      <Text style={styles.vehicleSubtitle}>{trim}</Text>

      <View style={styles.divider} />

      <View style={styles.table}>
        {specRows.map((row, index) => (
          <View
            key={row.label}
            style={[
              styles.tableRow,
              index === specRows.length - 1 && styles.tableRowLast,
            ]}
          >
            <Text style={styles.rowLabel}>{row.label}</Text>
            {row.isBrand ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
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
          <Text style={[styles.infoTitle, { marginBottom: 8 }]}>Initial Component Health Status</Text>
          <View style={{ gap: 8, backgroundColor: '#131313', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#2f313130', marginBottom: 12 }}>
            {[
              { key: 'engineOil', label: 'Engine Oil' },
              { key: 'coolant', label: 'Coolant' },
              { key: 'tires', label: 'Tires' },
              { key: 'brakePads', label: 'Brake Pads' },
              { key: 'battery', label: '12V Battery' },
            ].map((item) => {
              const val = initialComponentHealths[item.key] || 'GOOD';
              let color = '#4caf50';
              if (val === 'NEEDING_ATTENTION') color = '#ff9800';
              if (val === 'CRITICAL') color = '#f44336';
              return (
                <View key={item.key} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontFamily: 'Inter', fontSize: 13, color: '#c4c7c8' }}>{item.label}</Text>
                  <Text style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: '700', color }}>
                    {val === 'NEEDING_ATTENTION' ? 'ATTENTION' : val}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Informational Checklist Section */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>
          AutoCare AI will build a Digital Twin of your vehicle.
        </Text>
        <View style={styles.checklist}>
          {[
            'Factory specifications',
            'Components',
            'Maintenance schedule',
            'Recommended service intervals',
            'AI insights',
          ].map((item) => (
            <View key={item} style={styles.checkItem}>
              <View style={styles.checkIconWrapper}>
                <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"
                    fill="#abc7ff"
                  />
                </Svg>
              </View>
              <Text style={styles.checkItemText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1c1c1c',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2f3131',
    alignSelf: 'stretch',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
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
    gap: 6,
  },
  badgeText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700',
    color: '#abc7ff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  primaryBadge: {
    backgroundColor: '#abc7ff20',
    borderColor: '#abc7ff',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  primaryBadgeText: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '700',
    color: '#abc7ff',
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
    color: '#c4c7c8',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#2f3131',
    marginVertical: 12,
  },
  table: {
    alignSelf: 'stretch',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2f313130',
  },
  tableRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  rowLabel: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#c4c7c8',
  },
  rowValue: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    maxWidth: '65%',
  },
  italicText: {
    fontStyle: 'italic',
    color: '#8e9192',
    fontWeight: '400',
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#2f3131',
    marginTop: 20,
    marginBottom: 16,
  },
  infoSection: {
    backgroundColor: '#131313',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2f313130',
  },
  infoTitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '700',
    color: '#abc7ff',
    marginBottom: 12,
    lineHeight: 20,
  },
  checklist: {
    gap: 8,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIconWrapper: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1b2333',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkItemText: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: '#c4c7c8',
    fontWeight: '500',
  },
});
