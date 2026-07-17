import React from 'react';
import { ActivityIndicator, FlatList, Platform, StyleSheet, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedIcon } from '@/components/animated-icon';
import { HintRow } from '@/components/hint-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

import { useVehicles } from '@/hooks/vehicle/useVehicles';
import { VehicleOnboardingScreen } from '@/features/vehicle/screens/VehicleOnboardingScreen';

export default function HomeScreen() {
  const { data: vehiclesData, isLoading: loadingVehicles, refetch } = useVehicles();
  const [showOnboarding, setShowOnboarding] = React.useState(false);

  if (loadingVehicles) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#abc7ff" />
      </ThemedView>
    );
  }

  // If user has 0 vehicles, or explicitly requested onboarding, display the Onboarding Wizard
  const totalVehicles = vehiclesData?.totalElements ?? 0;
  if (totalVehicles === 0 || showOnboarding) {
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
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.heroSection}>
          <AnimatedIcon />
          <ThemedText type="title" style={styles.title}>
            Your Garage ({totalVehicles})
          </ThemedText>
          <ThemedText type="subtitle" style={styles.subtitle}>
            Digital twin active for your onboarding vehicle.
          </ThemedText>
          
          <TouchableOpacity
            onPress={() => setShowOnboarding(true)}
            style={styles.addButton}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Add new vehicle"
          >
            <ThemedText style={styles.addButtonText}>+ Add Vehicle</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* List of current vehicles */}
        <FlatList
          data={vehiclesData?.content || []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ThemedView type="backgroundElement" style={styles.vehicleCard}>
              <ThemedText style={styles.vehicleName}>
                {`${item.year} ${item.brandName} ${item.modelName}`}
              </ThemedText>
              <ThemedText type="small" style={styles.vehicleDetails}>
                {`Plate: ${item.licensePlate || 'N/A'} • Odometer: ${item.currentMileage} ${item.mileageUnit}`}
              </ThemedText>
            </ThemedView>
          )}
          style={styles.vehiclesList}
          showsVerticalScrollIndicator={false}
        />

        <ThemedView type="backgroundElement" style={styles.stepContainer}>
          <HintRow
            title="Try editing"
            hint={<ThemedText type="code">src/app/index.tsx</ThemedText>}
          />
          <HintRow title="Dev tools" hint={<ThemedText type="small">use browser devtools</ThemedText>} />
        </ThemedView>

        {Platform.OS === 'web' && <WebBadge />}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#131313',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 10,
    gap: Spacing.two,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 14,
    color: '#c4c7c8',
  },
  vehiclesList: {
    flex: 1,
    alignSelf: 'stretch',
    marginTop: 10,
  },
  vehicleCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#212225',
    alignSelf: 'stretch',
  },
  vehicleName: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  vehicleDetails: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: '#c4c7c8',
  },
  stepContainer: {
    gap: Spacing.three,
    alignSelf: 'stretch',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.four,
  },
  addButton: {
    backgroundColor: '#abc7ff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#abc7ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  addButtonText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '700',
    color: '#131313',
  },
});
