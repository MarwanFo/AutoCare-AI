import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';

export function AnimatedSplashOverlay() {
  useEffect(() => {
    // Gracefully dismiss native splash screen once JavaScript runtime is mounted
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <View style={styles.splashOverlay}>
      <View style={styles.logoWrapper}>
        <View style={styles.logoGlow} pointerEvents="none" />
        <Image
          source={require('@/assets/images/autocare-logo.png')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="AutoCare AI"
        />
      </View>
      <ActivityIndicator size="small" color="#3B82F6" style={styles.spinner} />
    </View>
  );
}

export function AnimatedIcon() {
  return null;
}

const styles = StyleSheet.create({
  splashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0B0D11',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  logoWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlow: {
    position: 'absolute',
    width: 220,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(59, 130, 246, 0.18)',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 8,
  },
  logo: {
    width: 240,
    height: 118,
    maxWidth: '80%',
  },
  spinner: {
    marginTop: 28,
  },
});
