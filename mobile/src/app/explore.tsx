import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, StatusBar, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useAppTranslation } from '@/i18n/hooks/useAppTranslation';
import { useVehicles } from '@/hooks/vehicle/useVehicles';
import { useRTL } from '@/i18n/hooks/useRTL';
import { useRouter } from 'expo-router';

export default function ExploreScreen() {
  const { t } = useAppTranslation(['garage', 'common', 'maintenance']);
  const { isRTL } = useRTL();
  const router = useRouter();
  const { data: vehiclesData, isLoading, refetch, isRefetching } = useVehicles({ page: 0, size: 50 });

  const vehicles = vehiclesData?.content || [];
  const totalVehicles = vehicles.length;

  // Calculate live fleet average completeness / health score
  const avgFleetHealth = totalVehicles > 0
    ? Math.round(
        vehicles.reduce((acc, v) => acc + (v.completenessScore != null ? v.completenessScore : 85), 0) / totalVehicles
      )
    : 100;

  const getHealthBadgeColor = (score: number) => {
    if (score >= 80) return '#4caf50';
    if (score >= 50) return '#ff9800';
    return '#f44336';
  };

  return (
    <View style={styles.background}>
      <StatusBar barStyle="light-content" backgroundColor="#0e0e0e" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={[styles.header, isRTL && styles.headerRtl]}>
          <Text style={[styles.headerTitle, isRTL && styles.textRtl]}>
            {t('garage:dashboard.fleet_health_overview')}
          </Text>
          <Text style={[styles.headerSubtitle, isRTL && styles.textRtl]}>
            {t('garage:dashboard.overall_status')}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#abc7ff"
              colors={['#abc7ff']}
            />
          }
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#abc7ff" />
              <Text style={styles.loadingText}>{t('common:status.loading')}</Text>
            </View>
          ) : (
            <>
              {/* Card 1: Live Fleet Health Score */}
              <View style={styles.card}>
                <View style={[styles.cardHeader, isRTL && styles.rowRtl]}>
                  <View style={styles.iconWrapper}>
                    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                        fill="#abc7ff"
                      />
                    </Svg>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, isRTL && styles.textRtl]}>
                      {t('garage:dashboard.fleet_health_overview')}
                    </Text>
                    <Text style={[styles.cardSubtitle, isRTL && styles.textRtl]}>
                      {totalVehicles > 0
                        ? `${totalVehicles} ${totalVehicles === 1 ? 'vehicle' : 'vehicles'} active`
                        : 'No vehicles in garage'}
                    </Text>
                  </View>
                </View>

                <View style={[styles.metricBig, isRTL && { alignItems: 'flex-end' }]}>
                  <Text style={[styles.metricNumber, { color: getHealthBadgeColor(avgFleetHealth) }]}>
                    {avgFleetHealth}%
                  </Text>
                  <Text style={[styles.metricLabel, isRTL && styles.textRtl]}>
                    {avgFleetHealth >= 80 ? t('garage:dashboard.optimal_state') : 'Attention Required'}
                  </Text>
                </View>
              </View>

              {/* Card 2: Predictive Maintenance AI */}
              <View style={styles.card}>
                <View style={[styles.cardHeader, isRTL && styles.rowRtl]}>
                  <View style={styles.iconWrapper}>
                    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M12 2L14.85 8.15L21.5 9.12L16.7 13.8L17.83 20.42L12 17.27L6.17 20.42L7.3 13.8L2.5 9.12L9.15 8.15L12 2Z"
                        fill="#abc7ff"
                      />
                    </Svg>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, isRTL && styles.textRtl]}>
                      {t('garage:dashboard.predictive_maintenance')}
                    </Text>
                    <Text style={[styles.cardSubtitle, isRTL && styles.textRtl]}>
                      {t('garage:dashboard.gemini_engine')}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.cardDescription, isRTL && styles.textRtl]}>
                  {t('garage:dashboard.telemetry_description')}
                </Text>
              </View>

              {/* Card 3: Vehicles Fleet Breakdown */}
              {totalVehicles > 0 && (
                <View style={styles.card}>
                  <Text style={[styles.sectionTitle, isRTL && styles.textRtl]}>
                    Fleet Breakdown
                  </Text>

                  <View style={styles.vehiclesList}>
                    {vehicles.map((v) => {
                      const score = v.completenessScore != null ? v.completenessScore : 85;
                      return (
                        <View key={v.id} style={[styles.vehicleItem, isRTL && styles.rowRtl]}>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.vehicleName, isRTL && styles.textRtl]}>
                              {v.year} {v.brandName} {v.modelName}
                            </Text>
                            <Text style={[styles.vehicleSub, isRTL && styles.textRtl]}>
                              {v.currentMileage ? `${v.currentMileage.toLocaleString()} ${v.mileageUnit}` : '0 KM'}
                              {v.nickname ? ` • "${v.nickname}"` : ''}
                            </Text>
                          </View>
                          <View style={styles.scorePill}>
                            <Text style={[styles.scoreText, { color: getHealthBadgeColor(score) }]}>
                              {score}%
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#0e0e0e',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 18,
  },
  header: {
    paddingVertical: 16,
    marginBottom: 8,
  },
  headerRtl: {
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#8e9192',
    marginTop: 2,
  },
  textRtl: {
    textAlign: 'right',
  },
  rowRtl: {
    flexDirection: 'row-reverse',
  },
  content: {
    paddingBottom: 40,
    gap: 14,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: '#8e9192',
  },
  card: {
    backgroundColor: '#18181b',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#abc7ff15',
    borderWidth: 1,
    borderColor: '#abc7ff35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#8e9192',
  },
  metricBig: {
    alignItems: 'flex-start',
  },
  metricNumber: {
    fontSize: 36,
    fontWeight: '800',
  },
  metricLabel: {
    fontSize: 13,
    color: '#a1a1aa',
    marginTop: 2,
  },
  cardDescription: {
    fontSize: 13,
    color: '#a1a1aa',
    lineHeight: 19,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 14,
  },
  vehiclesList: {
    gap: 10,
  },
  vehicleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#09090b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  vehicleName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  vehicleSub: {
    fontSize: 12,
    color: '#71717a',
    marginTop: 2,
  },
  scorePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#18181b',
  },
  scoreText: {
    fontSize: 13,
    fontWeight: '700',
  },
});

