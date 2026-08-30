import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface AuthCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function AuthCard({ children, style }: AuthCardProps) {
  return (
    <Animated.View
      entering={FadeInDown.duration(600).delay(200)}
      style={[styles.card, style]}
    >
      {/* Top Accent Gradient Bar Accent */}
      <View style={styles.topAccentBarContainer}>
        <View style={styles.topAccentBar} />
      </View>
      
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
    backgroundColor: '#131722',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 28,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  topAccentBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topAccentBar: {
    width: '60%',
    height: '100%',
    backgroundColor: '#3B82F6',
    opacity: 0.6,
  },
});
