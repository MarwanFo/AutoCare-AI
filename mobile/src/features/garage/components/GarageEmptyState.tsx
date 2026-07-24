import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

interface GarageEmptyStateProps {
  onAddVehicle: () => void;
}

export function GarageEmptyState({ onAddVehicle }: GarageEmptyStateProps) {
  return (
    <View style={styles.container}>
      {/* AI Digital Twin Graphic Ring */}
      <View style={styles.iconRing}>
        <View style={styles.iconInner}>
          <Svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            {/* Car Icon */}
            <Path
              d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.08 3.11H5.77L6.85 7zM7.5 16c-.83 0-1.5-.67-1.5-1.5S6.67 13 7.5 13s1.5.67 1.5 1.5S8.33 16 7.5 16zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"
              fill="#abc7ff"
            />
          </Svg>
        </View>
        <View style={styles.badgeSparkle}>
          <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 2L14.85 8.15L21.5 9.12L16.7 13.8L17.83 20.42L12 17.27L6.17 20.42L7.3 13.8L2.5 9.12L9.15 8.15L12 2Z"
              fill="#3b82f6"
            />
          </Svg>
        </View>
      </View>

      <Text style={styles.title}>Your Digital Garage is Empty</Text>

      <Text style={styles.subtitle}>
        Onboard your first vehicle to build its AI Digital Twin, track component wear, and receive predictive maintenance intelligence.
      </Text>

      {/* Feature Pills */}
      <View style={styles.featureGrid}>
        <View style={styles.featurePill}>
          <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <Path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#abc7ff" />
          </Svg>
          <Text style={styles.featureText}>AI Profile & Maintenance Guide</Text>
        </View>
        <View style={styles.featurePill}>
          <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <Path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#abc7ff" />
          </Svg>
          <Text style={styles.featureText}>Live Component Health Tracking</Text>
        </View>
      </View>

      {/* Hero Action CTA */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={onAddVehicle}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Add your first vehicle"
      >
        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <Path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="#131313" />
        </Svg>
        <Text style={styles.actionButtonText}>Onboard Your Vehicle</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    width: '100%',
  },
  iconRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#abc7ff12',
    borderWidth: 1.5,
    borderColor: '#abc7ff35',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  iconInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1c2433',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeSparkle: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#18181b',
    borderRadius: 10,
    padding: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Inter',
  },
  subtitle: {
    fontSize: 14,
    color: '#a1a1aa',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 8,
    fontFamily: 'Inter',
  },
  featureGrid: {
    width: '100%',
    gap: 8,
    marginBottom: 24,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#27272a70',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3f3f4650',
  },
  featureText: {
    fontSize: 13,
    color: '#e4e4e7',
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#abc7ff',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 28,
    width: '100%',
    shadowColor: '#abc7ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#131313',
    fontFamily: 'Inter',
  },
});
