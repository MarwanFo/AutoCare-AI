import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

interface ErrorBannerProps {
  message: string | null;
}

function WarningIcon({ color }: { color: string }) {
  return (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
        fill={color}
      />
    </Svg>
  );
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  if (!message) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      exiting={FadeOutUp.duration(300)}
      style={styles.container}
    >
      <View style={styles.iconContainer}>
        <WarningIcon color="#EF4444" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>System Alert</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    alignSelf: 'stretch',
    marginBottom: 16,
  },
  iconContainer: {
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#F87171',
    fontSize: 12,
    fontFamily: 'Inter',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  message: {
    color: '#FECACA',
    fontSize: 13,
    fontFamily: 'Inter',
    lineHeight: 18,
  },
});
