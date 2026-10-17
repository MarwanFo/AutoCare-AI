import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export function AnimatedSplashOverlay() {
  useEffect(() => {
    // Gracefully dismiss native splash screen once JavaScript runtime is mounted
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <View style={styles.splashOverlay}>
      <ActivityIndicator size="large" color="#3B82F6" />
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
});
