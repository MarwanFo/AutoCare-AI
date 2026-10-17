import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

interface ModelCardProps {
  name: string;
  isSelected: boolean;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ModelCard({ name, isSelected, onPress }: ModelCardProps) {
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
      <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
        <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <Path
            d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.28 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01ZM6.85 7H17.14L18.22 10.14H5.78L6.85 7ZM19 17H5V13H19V17Z"
            fill={isSelected ? '#3B82F6' : '#94A3B8'}
          />
        </Svg>
      </View>
      <Text style={[styles.modelName, isSelected && styles.modelNameSelected]}>
        {name}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181D2A',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 10,
    alignSelf: 'stretch',
  },
  cardSelected: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#141824',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconContainerSelected: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  modelName: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '600',
    color: '#F8FAFC',
    flex: 1,
  },
  modelNameSelected: {
    color: '#3B82F6',
    fontWeight: '700',
  },
});
