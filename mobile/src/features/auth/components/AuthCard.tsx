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
      entering={FadeInDown.duration(500).delay(200)}
      style={[styles.card, style]}
    >
      {/* Top Accent Gradient Bar */}
      <View style={styles.topAccentBarContainer} pointerEvents="none">
        <View style={styles.topAccentBar} />
      </View>
      
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
    backgroundColor: '#141824',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 22,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 6,
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
    width: '50%',
    height: '100%',
    backgroundColor: '#3B82F6',
    opacity: 0.8,
    borderRadius: 1,
  },
});

