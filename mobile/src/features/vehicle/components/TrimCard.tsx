import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

interface TrimCardProps {
  name: string;
  isSelected: boolean;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function TrimCard({ name, isSelected, onPress }: TrimCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 12, stiffness: 250 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1.0, { damping: 12, stiffness: 250 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        isSelected && styles.cardSelected,
        animatedStyle,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
    >
      <Text style={[styles.trimName, isSelected && styles.trimNameSelected]}>
        {name}
      </Text>
      {isSelected && (
        <View style={styles.checkIcon}>
          <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <Path
              d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"
              fill="#abc7ff"
            />
          </Svg>
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1c1c1c',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#2f3131',
    marginBottom: 10,
    alignSelf: 'stretch',
  },
  cardSelected: {
    borderColor: '#abc7ff',
    backgroundColor: '#1b2333',
  },
  trimName: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
    color: '#e5e2e1',
  },
  trimNameSelected: {
    color: '#ffffff',
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#131e33',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
