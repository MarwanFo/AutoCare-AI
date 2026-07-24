import React from 'react';
import { ScrollView, StyleSheet, Text, View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

export default function ExploreScreen() {
  return (
    <View style={styles.background}>
      <StatusBar barStyle="light-content" backgroundColor="#0e0e0e" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Vehicle Analytics</Text>
          <Text style={styles.headerSubtitle}>
            AI fleet insights & health telemetry
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Card 1: Maintenance Score */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconWrapper}>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                    fill="#abc7ff"
                  />
                </Svg>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Fleet Health Overview</Text>
                <Text style={styles.cardSubtitle}>Overall Digital Twin status</Text>
              </View>
            </View>

            <View style={styles.metricBig}>
              <Text style={styles.metricNumber}>98%</Text>
              <Text style={styles.metricLabel}>Optimal Operational State</Text>
            </View>
          </View>

          {/* Card 2: Predictive Maintenance AI */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconWrapper}>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 2L14.85 8.15L21.5 9.12L16.7 13.8L17.83 20.42L12 17.27L6.17 20.42L7.3 13.8L2.5 9.12L9.15 8.15L12 2Z"
                    fill="#abc7ff"
                  />
                </Svg>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Predictive Maintenance</Text>
                <Text style={styles.cardSubtitle}>Gemini Intelligence Engine</Text>
              </View>
            </View>

            <Text style={styles.cardDescription}>
              Component degradation models are active. All fluid levels and wear intervals are operating within calibrated safety parameters.
            </Text>
          </View>
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
    marginTop: 2,
  },
  content: {
    paddingBottom: 40,
    gap: 14,
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
    fontFamily: 'Inter',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#8e9192',
    fontFamily: 'Inter',
  },
  metricBig: {
    alignItems: 'flex-start',
  },
  metricNumber: {
    fontSize: 36,
    fontWeight: '800',
    color: '#abc7ff',
    fontFamily: 'Inter',
  },
  metricLabel: {
    fontSize: 13,
    color: '#a1a1aa',
    fontFamily: 'Inter',
    marginTop: 2,
  },
  cardDescription: {
    fontSize: 13,
    color: '#a1a1aa',
    lineHeight: 19,
    fontFamily: 'Inter',
  },
});
