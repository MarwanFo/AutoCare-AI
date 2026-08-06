import React, { useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { useVehicles } from '@/hooks/vehicle/useVehicles';
import { VehicleOnboardingScreen } from '@/features/vehicle/screens/VehicleOnboardingScreen';
import { VehicleDetailsModal } from '@/features/vehicle/components/VehicleDetailsModal';
import { GarageVehicleCard } from '@/features/garage/components/GarageVehicleCard';
import { GarageEmptyState } from '@/features/garage/components/GarageEmptyState';
import { GarageSkeleton } from '@/features/garage/components/GarageSkeleton';
import { useAppTranslation } from '@/i18n/hooks/useAppTranslation';

export default function GarageHomeScreen() {
  const { t } = useAppTranslation('garage');
  const { data: vehiclesData, isLoading, isRefetching, refetch } = useVehicles();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  const totalVehicles = vehiclesData?.totalElements ?? 0;
  const vehicles = vehiclesData?.content ?? [];

  // Launch Onboarding Wizard directly if requested
  if (showOnboarding) {
    return (
      <VehicleOnboardingScreen
        onComplete={() => {
          setShowOnboarding(false);
          refetch();
        }}
        onCancel={() => setShowOnboarding(false)}
      />
    );
  }

  return (
    <View style={styles.background}>
      <StatusBar barStyle="light-content" backgroundColor="#0e0e0e" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Screen Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View style={styles.brandBadgeIcon}>
              <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.08 3.11H5.77L6.85 7zM7.5 16c-.83 0-1.5-.67-1.5-1.5S6.67 13 7.5 13s1.5.67 1.5 1.5S8.33 16 7.5 16zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"
                  fill="#abc7ff"
                />
              </Svg>
            </View>
            <View>
              <Text style={styles.headerTitle}>{t('garage:dashboard.title')}</Text>
              <Text style={styles.headerSubtitle}>
                {totalVehicles > 0
                  ? t('garage:dashboard.subtitle_active', {
                      count: totalVehicles,
                      defaultValue: `${totalVehicles} vehicles active`,
                    })
                  : t('garage:dashboard.subtitle_empty')}
              </Text>
            </View>
          </View>

          {/* Primary Action Button */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowOnboarding(true)}
            activeOpacity={0.85}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={t('garage:dashboard.add_vehicle')}
          >
            <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <Path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="#131313" />
            </Svg>
            <Text style={styles.addButtonText}>{t('garage:dashboard.add_vehicle')}</Text>
          </TouchableOpacity>
        </View>

        {/* Content Section */}
        {isLoading ? (
          <GarageSkeleton />
        ) : totalVehicles === 0 ? (
          <GarageEmptyState onAddVehicle={() => setShowOnboarding(true)} />
        ) : (
          <FlatList
            data={vehicles}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <GarageVehicleCard
                vehicle={item}
                onPress={() => setSelectedVehicleId(item.id)}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor="#abc7ff"
                colors={['#abc7ff']}
              />
            }
          />
        )}
      </SafeAreaView>

      {/* Vehicle Digital Twin Details Modal */}
      {selectedVehicleId && (
        <VehicleDetailsModal
          vehicleId={selectedVehicleId}
          visible={!!selectedVehicleId}
          onClose={() => setSelectedVehicleId(null)}
        />
      )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    marginBottom: 8,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandBadgeIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#abc7ff15',
    borderWidth: 1,
    borderColor: '#abc7ff35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: 'Inter',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#8e9192',
    fontFamily: 'Inter',
    marginTop: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#abc7ff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#abc7ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#131313',
    fontFamily: 'Inter',
  },
  listContent: {
    paddingBottom: 40,
    paddingTop: 4,
  },
});
