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
      entering={FadeInDown.duration(350)}
      exiting={FadeOutUp.duration(350)}
      style={styles.container}
    >
      <View style={styles.iconContainer}>
        <WarningIcon color="#ffb4ab" />
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
    backgroundColor: '#93000a', // bg-error-container = #93000a
    borderWidth: 1,
    borderColor: '#ffb4ab', // border-error = #ffb4ab
    borderRadius: 16, // rounded-md = 16px
    padding: 14,
    alignItems: 'center',
    alignSelf: 'stretch',
    marginBottom: 24, // spacing.baseline * 3 = 24px
  },
  iconContainer: {
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#ffb4ab', // error = #ffb4ab
    fontSize: 12,
    fontFamily: 'JetBrains Mono',
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  message: {
    color: '#ffdad6', // on-error-container = #ffdad6
    fontSize: 13,
    fontFamily: 'Inter',
    lineHeight: 18,
  },
});
