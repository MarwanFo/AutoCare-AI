import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAppTranslation } from '@/i18n/hooks/useAppTranslation';

interface BrandHeaderProps {
  subtitle?: string;
}

export function BrandHeader({ subtitle }: BrandHeaderProps) {
  const { t } = useAppTranslation('auth');

  return (
    <Animated.View
      entering={FadeInDown.duration(500).delay(100)}
      style={styles.container}
    >
      {/* Automotive Brand Logo with Ambient Glow */}
      <View style={styles.logoWrapper}>
        <View style={styles.logoGlow} pointerEvents="none" />
        <Image
          source={require('@/assets/images/autocare-logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
          accessibilityLabel="AutoCare AI"
        />
      </View>

      {/* Tagline Subtitle */}
      <Text style={styles.subtitle}>{subtitle || t('auth:subtitle')}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    marginBottom: 20,
  },
  logoWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  logoGlow: {
    position: 'absolute',
    width: 180,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(59, 130, 246, 0.16)',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 4,
  },
  logoImage: {
    width: 210,
    height: 102,
    maxWidth: '85%',
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
    color: '#94A3B8',
    textAlign: 'center',
    maxWidth: 300,
    letterSpacing: 0.2,
  },
});
