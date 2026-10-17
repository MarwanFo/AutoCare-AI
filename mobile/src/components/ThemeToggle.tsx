import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useAppTheme } from '@/theme/ThemeProvider';

interface ThemeToggleProps {
  style?: ViewStyle;
  showLabel?: boolean;
}

export function ThemeToggle({ style, showLabel = false }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useAppTheme();

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      activeOpacity={0.75}
      style={[
        styles.container,
        isDark ? styles.containerDark : styles.containerLight,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      accessibilityHint="Toggles between dark and light appearance"
    >
      <View style={styles.iconWrapper}>
        {isDark ? (
          // Sun Icon for switching to light mode
          <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z"
              stroke="#F59E0B"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path d="M12 1V3" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M12 21V23" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M4.22 4.22L5.64 5.64" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M18.36 18.36L19.78 19.78" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M1 12H3" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M21 12H23" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M4.22 19.78L5.64 18.36" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M18.36 5.64L19.78 4.22" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        ) : (
          // Moon Icon for switching to dark mode
          <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <Path
              d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"
              stroke="#2563EB"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="rgba(37, 99, 235, 0.15)"
            />
          </Svg>
        )}
      </View>

      {showLabel && (
        <Text style={[styles.label, isDark ? styles.labelDark : styles.labelLight]}>
          {isDark ? 'Light' : 'Dark'}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  containerDark: {
    backgroundColor: '#181D2A',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  containerLight: {
    backgroundColor: '#F1F5F9',
    borderColor: 'rgba(15, 23, 42, 0.08)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  labelDark: {
    color: '#F8FAFC',
  },
  labelLight: {
    color: '#0F172A',
  },
});
