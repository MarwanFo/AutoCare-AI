import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface YearPickerProps {
  selectedYear: number | null;
  onSelectYear: (year: number) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function YearPicker({ selectedYear, onSelectYear }: YearPickerProps) {
  // Generate years from current year + 2 down to 1990
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear + 2 - 1980 + 1 }, (_, index) => currentYear + 2 - index);

  const renderItem = ({ item: year }: { item: number }) => {
    const isSelected = selectedYear === year;
    return (
      <YearGridItem
        year={year}
        isSelected={isSelected}
        onPress={() => onSelectYear(year)}
      />
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={years}
        renderItem={renderItem}
        keyExtractor={(item) => item.toString()}
        numColumns={3}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#131313',
    borderWidth: 1,
    borderColor: '#2f3131',
    padding: 8,
  },
  listContent: {
    paddingVertical: 8,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    gap: 8,
  },
  yearItem: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#1c1c1c',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2f3131',
    marginBottom: 8,
  },
  yearItemSelected: {
    borderColor: '#abc7ff',
    backgroundColor: '#1b2333',
  },
  yearText: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
    color: '#e5e2e1',
  },
  yearTextSelected: {
    color: '#ffffff',
  },
});
