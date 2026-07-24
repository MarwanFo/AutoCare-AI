import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export function GarageSkeleton() {
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [fadeAnim]);

  return (
    <View style={styles.container}>
      {[1, 2].map((key) => (
        <Animated.View key={key} style={[styles.cardSkeleton, { opacity: fadeAnim }]}>
          <View style={styles.headerSkeleton}>
            <View style={styles.titleSkeleton} />
            <View style={styles.badgeSkeleton} />
          </View>
          <View style={styles.subtitleSkeleton} />
          <View style={styles.metricsSkeleton} />
          <View style={styles.footerSkeleton} />
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 14,
    marginTop: 10,
  },
  cardSkeleton: {
    backgroundColor: '#18181b',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#27272a',
    gap: 12,
  },
  headerSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleSkeleton: {
    width: '60%',
    height: 22,
    backgroundColor: '#27272a',
    borderRadius: 6,
  },
  badgeSkeleton: {
    width: 60,
    height: 20,
    backgroundColor: '#27272a',
    borderRadius: 10,
  },
  subtitleSkeleton: {
    width: '40%',
    height: 14,
    backgroundColor: '#27272a',
    borderRadius: 4,
  },
  metricsSkeleton: {
    width: '100%',
    height: 52,
    backgroundColor: '#212225',
    borderRadius: 14,
  },
  footerSkeleton: {
    width: '30%',
    height: 16,
    backgroundColor: '#27272a',
    borderRadius: 6,
  },
});
