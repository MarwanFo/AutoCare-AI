import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import Svg, { Path } from 'react-native-svg';

interface BrandCardProps {
  name: string;
  logoUrl?: string;
  isSelected: boolean;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Custom SVG Car Icon as a high-quality fallback matching Stitch system aesthetics
function DefaultCarIcon({ color = '#c4c7c8' }: { color?: string }) {
  return (
    <Svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <Path
        d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.28 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01ZM6.85 7H17.14L18.22 10.14H5.78L6.85 7ZM19 17H5V13H19V17ZM7.5 16C8.33 16 9 15.33 9 14.5C9 13.67 8.33 13 7.5 13C6.67 13 6 13.67 6 14.5C6 15.33 6.67 16 7.5 16ZM16.5 16C17.33 16 18 15.33 18 14.5C18 13.67 17.33 13 16.5 13C15.67 13 15 13.67 15 14.5C15 15.33 15.67 16 16.5 16Z"
        fill={color}
      />
    </Svg>
  );
}

export function BrandCard({ name, logoUrl, isSelected, onPress }: BrandCardProps) {
  const scale = useSharedValue(1);
  const skeletonOpacity = useSharedValue(0.4);
  const [loading, setLoading] = React.useState(!!logoUrl);
  const [error, setError] = React.useState(false);

  // Initialize pulsating skeleton animation
  React.useEffect(() => {
    if (loading) {
      skeletonOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 600 }),
          withTiming(0.4, { duration: 600 })
        ),
        -1, // infinite loop
        true // reverse
      );
    }
  }, [loading]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const skeletonAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: skeletonOpacity.value,
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 12, stiffness: 250 });
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
      <View style={styles.imageContainer}>
        {logoUrl && !error ? (
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: logoUrl }}
              style={styles.logo}
              contentFit="contain"
              transition={200}
              cachePolicy="disk" // Explicit disk cache strategy
              onLoadStart={() => setLoading(true)}
              onLoadEnd={() => setLoading(false)}
              onError={() => {
                setError(true);
                setLoading(false);
              }}
            />
            {loading && (
              <Animated.View
                style={[
                  styles.skeleton,
                  skeletonAnimatedStyle,
                ]}
              />
            )}
          </View>
        ) : (
          <View style={[styles.fallbackContainer, isSelected && styles.fallbackContainerSelected]}>
            <DefaultCarIcon color={isSelected ? '#abc7ff' : '#c4c7c8'} />
          </View>
        )}
      </View>
      <Text style={[styles.brandName, isSelected && styles.brandNameSelected]}>
        {name}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1c1c1c',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2f3131',
    marginBottom: 12,
  },
  cardSelected: {
    borderColor: '#abc7ff',
    backgroundColor: '#1b2333',
  },
  imageContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logo: {
    width: 40,
    height: 40,
  },
  skeleton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#2e3132',
  },
  fallbackContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2e3132',
  },
  fallbackContainerSelected: {
    backgroundColor: '#354366',
  },
  brandName: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: '#e5e2e1',
    textAlign: 'center',
  },
  brandNameSelected: {
    color: '#ffffff',
  },
});
