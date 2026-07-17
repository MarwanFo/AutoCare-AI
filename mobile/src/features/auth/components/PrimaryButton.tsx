import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ArrowForwardIcon({ color }: { color: string }) {
  return (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z"
        fill={color}
      />
    </Svg>
  );
}

export function PrimaryButton({
  title,
  onPress,
  isLoading = false,
  disabled = false,
  style,
}: PrimaryButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    if (!disabled && !isLoading) {
      scale.value = withSpring(0.98, { damping: 10, stiffness: 200 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1.0, { damping: 10, stiffness: 200 });
  };

  const isBtnDisabled = disabled || isLoading;

  return (
    <AnimatedPressable
      style={[
        styles.button,
        {
          opacity: isBtnDisabled ? 0.7 : 1,
        },
        animatedStyle,
        style,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isBtnDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isBtnDisabled }}
    >
      {isLoading ? (
        <ActivityIndicator color="#2f3131" />
      ) : (
        <Animated.View style={styles.contentContainer}>
          <Text style={styles.buttonText}>{title}</Text>
          <ArrowForwardIcon color="#2f3131" />
        </Animated.View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56, // py-4 px-6 = ~56px height
    borderRadius: 9999, // rounded-full
    backgroundColor: '#ffffff', // bg-primary = #ffffff
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
    // shadow-[0_0_20px_rgba(255,255,255,0.1)]
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 14, // text-button = 14px
    fontFamily: 'Inter',
    fontWeight: '600', // font-button = 600
    letterSpacing: 0.14, // letterSpacing = 0.01em
    color: '#2f3131', // text-on-primary = #2f3131
    marginRight: 8, // ml-2 spacing equivalent (placed on-right of buttonText)
  },
});
