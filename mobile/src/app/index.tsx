import React, { useState } from 'react';
import {
  FlatList,
  Image,
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
      <StatusBar barStyle="light-content" backgroundColor="#0B0D11" />
      <View style={styles.topGlow} pointerEvents="none" />
      <View style={styles.bottomGlow} pointerEvents="none" />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Screen Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View style={styles.brandBadgeIcon}>
              <Image
                source={require('@/assets/images/autocare-mark.png')}
                style={styles.brandMarkImage}
                resizeMode="contain"
                accessibilityLabel="AutoCare AI Mark"
              />
            </View>
            <View style={styles.titleTextContainer}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {t('garage:dashboard.title')}
              </Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
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
            <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <Path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="#FFFFFF" />
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
                tintColor="#3B82F6"
                colors={['#3B82F6']}
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
    backgroundColor: '#0B0D11',
    position: 'relative',
    overflow: 'hidden',
  },
  topGlow: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#3B82F6',
    opacity: 0.08,
  },
  bottomGlow: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#1D4ED8',
    opacity: 0.06,
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: 850,
    alignSelf: 'center',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    marginBottom: 6,
  },
  headerTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginRight: 10,
    minWidth: 0,
  },
  titleTextContainer: {
    flex: 1,
    minWidth: 0,
  },
  brandBadgeIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandMarkImage: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 1,
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  listContent: {
    paddingBottom: 32,
    paddingTop: 4,
  },
});
