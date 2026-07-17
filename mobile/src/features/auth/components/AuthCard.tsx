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
    backgroundColor: '#201f1f', // bg-surface-container
    borderWidth: 1,
    borderColor: '#444748', // border-outline-variant
    borderRadius: 32, // rounded-lg = 2rem = 32px
    paddingHorizontal: 24, // p-container-padding-mobile / desktop padding
    paddingVertical: 32,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
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
    width: '80%',
    height: '100%',
    backgroundColor: '#abc7ff', // secondary
    opacity: 0.5, // opacity-50
  },
});
