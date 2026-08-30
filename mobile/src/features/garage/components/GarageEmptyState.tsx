import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useAppTranslation } from '@/i18n/hooks/useAppTranslation';

interface GarageEmptyStateProps {
  onAddVehicle: () => void;
}

export function GarageEmptyState({ onAddVehicle }: GarageEmptyStateProps) {
  const { t } = useAppTranslation('garage');

  return (
    <View style={styles.container}>
      {/* Precision Icon Center */}
      <View style={styles.iconRing}>
        <View style={styles.iconInner}>
          <Svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <Path
              d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.08 3.11H5.77L6.85 7zM7.5 16c-.83 0-1.5-.67-1.5-1.5S6.67 13 7.5 13s1.5.67 1.5 1.5S8.33 16 7.5 16zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"
              fill="#3B82F6"
            />
          </Svg>
        </View>
      </View>

      <Text style={styles.title}>{t('garage:empty.title')}</Text>

      <Text style={styles.subtitle}>
        {t('garage:empty.subtitle')}
      </Text>

      {/* Feature Points */}
      <View style={styles.featureGrid}>
        <View style={styles.featurePill}>
          <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <Path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#10B981" />
          </Svg>
          <Text style={styles.featureText}>{t('garage:empty.feature_ai_profile')}</Text>
        </View>
        <View style={styles.featurePill}>
          <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <Path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#10B981" />
          </Svg>
          <Text style={styles.featureText}>{t('garage:empty.feature_health_tracking')}</Text>
        </View>
      </View>

      {/* Hero Action CTA */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={onAddVehicle}
        activeOpacity={0.85}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={t('garage:empty.action_onboard')}
      >
        <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <Path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="#FFFFFF" />
        </Svg>
        <Text style={styles.actionButtonText}>{t('garage:empty.action_onboard')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#131722',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
    width: '100%',
  },
  iconRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(59, 130, 246, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#181D2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 18,
    paddingHorizontal: 8,
    fontWeight: '400',
  },
  featureGrid: {
    width: '100%',
    gap: 8,
    marginBottom: 20,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#181D2A',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  featureText: {
    fontSize: 12,
    color: '#E2E8F0',
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
