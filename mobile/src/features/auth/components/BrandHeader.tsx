import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

export function BrandHeader() {
  return (
    <Animated.View
      entering={FadeInDown.duration(550).delay(100)}
      style={styles.container}
    >
      {/* 16px Rounded Square Logo Container */}
      <View style={styles.logoContainer}>
        {/* directions_car Material Icon Vector equivalent */}
        <Svg width="36" height="36" viewBox="0 0 24 24" fill="none">
          <Path
            d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.28 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01ZM6.85 7H17.14L18.22 10.14H5.78L6.85 7ZM19 17H5V13H19V17ZM7.5 16C8.33 16 9 15.33 9 14.5C9 13.67 8.33 13 7.5 13C6.67 13 6 13.67 6 14.5C6 15.33 6.67 16 7.5 16ZM16.5 16C17.33 16 18 15.33 18 14.5C18 13.67 17.33 13 16.5 13C15.67 13 15 13.67 15 14.5C15 15.33 15.67 16 16.5 16Z"
            fill="#FFFFFF"
          />
        </Svg>
      </View>

      {/* AutoCare AI Title (48px display size) */}
      <Text style={styles.title}>AutoCare AI</Text>
      
      {/* Tagline Subtitle (16px body size) */}
      <Text style={styles.subtitle}>
        Welcome back. Your vehicle's health is our priority.
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    marginBottom: 48, // mb-12 = 48px
  },
  logoContainer: {
    width: 64, // w-16 = 64px
    height: 64, // h-16 = 64px
    borderRadius: 16, // rounded-2xl = 16px
    backgroundColor: '#2a2a2a', // bg-surface-container-high
    borderWidth: 1,
    borderColor: 'rgba(68, 71, 72, 0.3)', // border-outline-variant/30
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24, // mb-6 = 24px
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 48, // text-display-lg = 48px
    lineHeight: 56,
    letterSpacing: -0.96, // letter-spacing: -0.02em
    fontWeight: '700',
    color: '#ffffff', // text-primary
    textAlign: 'center',
    marginBottom: 8, // mb-2 = 8px
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: 16, // text-body-md = 16px
    lineHeight: 24,
    fontWeight: '400',
    color: '#c4c7c8', // text-on-surface-variant
    textAlign: 'center',
    maxWidth: 320,
  },
});
