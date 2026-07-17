import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

interface VehicleAiHeaderProps {
  title: string;
  subtitle: string;
}

export function VehicleAiHeader({ title, subtitle }: VehicleAiHeaderProps) {
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

      {/* AutoCare AI Title */}
      <Text style={styles.title}>{title}</Text>
      
      {/* Tagline Subtitle */}
      <Text style={styles.subtitle}>{subtitle}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    marginBottom: 32,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: 'rgba(68, 71, 72, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.64,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: '#c4c7c8',
    textAlign: 'center',
    maxWidth: 320,
  },
});
