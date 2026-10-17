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
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Animated.View style={styles.contentContainer}>
          <Text style={styles.buttonText}>{title}</Text>
          <ArrowForwardIcon color="#FFFFFF" />
        </Animated.View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 5,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
    color: '#FFFFFF',
    fontFamily: 'Inter',
    marginRight: 8,
  },
});
