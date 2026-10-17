import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface YearPickerProps {
  selectedYear: number | null;
  onSelectYear: (year: number) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function YearPicker({ selectedYear, onSelectYear }: YearPickerProps) {
  // Generate years from current year + 2 down to 1980
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear + 2 - 1980 + 1 }, (_, index) => currentYear + 2 - index);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        <View style={styles.gridWrapper}>
          {years.map((year) => (
            <YearGridItem
              key={year}
              year={year}
              isSelected={selectedYear === year}
              onPress={() => onSelectYear(year)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

interface YearGridItemProps {
  year: number;
  isSelected: boolean;
  onPress: () => void;
}

function YearGridItem({ year, isSelected, onPress }: YearGridItemProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 10, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1.0, { damping: 10, stiffness: 200 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.yearItem,
        isSelected && styles.yearItemSelected,
        animatedStyle,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
    >
      <Text style={[styles.yearText, isSelected && styles.yearTextSelected]}>
        {year}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 320,
    alignSelf: 'stretch',
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#141824',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 8,
  },
  listContent: {
    paddingVertical: 8,
  },
  gridWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 4,
    justifyContent: 'space-between',
  },
  yearItem: {
    width: '31%',
    height: 50,
    borderRadius: 12,
    backgroundColor: '#181D2A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 8,
  },
  yearItemSelected: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  yearText: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  yearTextSelected: {
    color: '#3B82F6',
    fontWeight: '700',
  },
});
