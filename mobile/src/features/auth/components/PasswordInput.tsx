import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useAppTheme } from '@/theme/ThemeProvider';

// Custom SVG Icons matching the Material Symbols used in Stitch
export function MailIcon({ color }: { color: string }) {
  return (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"
        fill={color}
      />
    </Svg>
  );
}

export function LockIcon({ color }: { color: string }) {
  return (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM9 6C9 4.34 10.34 3 12 3C13.66 3 15 4.34 15 6V8H9V6ZM18 20H6V10H18V20ZM12 17C13.1 17 14 16.1 14 15C14 13.9 13.1 13 12 13C10.9 13 10 13.9 10 15C10 16.1 10.9 17 12 17Z"
        fill={color}
      />
    </Svg>
  );
}

export function EyeIcon({ color, visible }: { color: string; visible: boolean }) {
  if (visible) {
    return (
      <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z"
          fill={color}
        />
      </Svg>
    );
  }
  return (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 7C14.76 7 17 9.24 17 12C17 13.41 16.42 14.68 15.48 15.59L17.65 17.76C19.78 16.29 21.6 14.31 22.9 12C21.17 7.61 16.9 4.5 11.9 4.5C10.43 4.5 9.03 4.81 7.76 5.37L9.5 7.11C10.27 6.42 11.28 6 12 7ZM2 4.27L4.28 6.55L4.73 7C3.06 8.3 1.69 10 1 12C2.73 16.39 7 19.5 12 19.5C13.8 19.5 15.5 19.06 17 18.27L17.45 18.72L19.73 21L21 19.73L3.27 3L2 4.27ZM7.52 9.79L9.24 11.51C9.09 11.67 9 11.83 9 12C9 13.66 10.34 15 12 15C12.17 15 12.33 14.91 12.49 14.76L14.21 16.48C13.55 16.8 12.8 17 12 17C9.24 17 7 14.76 7 12C7 11.2 7.2 10.45 7.52 9.79ZM11.9 9C12.75 9 13.5 9.25 14.12 9.68L10.82 6.38C11.17 6.13 11.53 6 11.9 9ZM12 9Z"
        fill={color}
      />
    </Svg>
  );
}

export interface FloatingInputProps extends TextInputProps {
  label: string;
  error?: string | null;
  prefixIcon?: React.ReactNode;
  children?: React.ReactNode;
  editable?: boolean;
}

export function FloatingInput({
  label,
  value = '',
  error,
  prefixIcon,
  children,
  editable = true,
  onFocus,
  onBlur,
  style,
  ...props
}: FloatingInputProps) {
  const { isDark } = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const floatProgress = useSharedValue(value.length > 0 ? 1 : 0);

  useEffect(() => {
    const shouldFloat = isFocused || value.length > 0;
    floatProgress.value = withTiming(shouldFloat ? 1 : 0, { duration: 180 });
  }, [isFocused, value]);

  const animatedLabelStyle = useAnimatedStyle(() => {
    const top = interpolate(floatProgress.value, [0, 1], [17, 7]);
    const fontSize = interpolate(floatProgress.value, [0, 1], [15, 11]);
    const color = interpolateColor(
      floatProgress.value,
      [0, 1],
      ['#64748B', isFocused ? '#3B82F6' : (isDark ? '#94A3B8' : '#64748B')]
    );

    return {
      top,
      fontSize,
      color,
    };
  });

  return (
    <View style={styles.outerContainer}>
      <View
        onTouchEnd={() => {
          if (editable) inputRef.current?.focus();
        }}
        style={[
          styles.container,
          {
            borderColor: error
              ? '#EF4444'
              : isFocused
              ? '#3B82F6'
              : isDark
              ? 'rgba(255, 255, 255, 0.08)'
              : 'rgba(15, 23, 42, 0.12)',
            backgroundColor: isDark
              ? (isFocused ? '#181D2A' : '#11141B')
              : (isFocused ? '#FFFFFF' : '#F8FAFC'),
          },
          isFocused && styles.containerFocused,
        ]}
      >
        {/* Left Prefix Icon */}
        <View style={styles.prefixContainer} pointerEvents="none">
          {prefixIcon}
        </View>

        {/* Input & Floating Label Area */}
        <View style={styles.inputArea}>
          <Animated.Text
            style={[
              styles.floatingLabel,
              animatedLabelStyle,
            ]}
            pointerEvents="none"
          >
            {label}
          </Animated.Text>
          <TextInput
            ref={inputRef}
            style={[styles.textInput, !isDark && styles.textInputLight, style]}
            value={value}
            editable={editable}
            autoCapitalize="none"
            autoCorrect={false}
            selectionColor="#3B82F6"
            onFocus={(e) => {
              setIsFocused(true);
              if (onFocus) onFocus(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              if (onBlur) onBlur(e);
            }}
            {...props}
          />
        </View>

        {/* Suffix/Action Children (e.g. Password Toggle) */}
        {children}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

// PasswordInput wraps FloatingInput with secureTextEntry toggle and lock icon
export function PasswordInput({
  label = 'Password',
  error,
  editable = true,
  ...props
}: Omit<FloatingInputProps, 'prefixIcon'>) {
  const { isDark } = useAppTheme();
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  return (
    <FloatingInput
      label={label}
      error={error}
      editable={editable}
      secureTextEntry={secureTextEntry}
      prefixIcon={<LockIcon color={error ? '#EF4444' : isDark ? '#94A3B8' : '#64748B'} />}
      {...props}
    >
      {/* Suffix password toggle button */}
      <TouchableOpacity
        style={styles.suffixButton}
        onPress={() => setSecureTextEntry((prev) => !prev)}
        disabled={!editable}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={secureTextEntry ? 'Show password' : 'Hide password'}
      >
        <EyeIcon
          color={error ? '#EF4444' : isDark ? '#94A3B8' : '#64748B'}
          visible={!secureTextEntry}
        />
      </TouchableOpacity>
    </FloatingInput>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    alignSelf: 'stretch',
    marginBottom: 16,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#11141B',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 58,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  containerFocused: {
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  prefixContainer: {
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputArea: {
    flex: 1,
    height: '100%',
    position: 'relative',
    justifyContent: 'center',
  },
  floatingLabel: {
    position: 'absolute',
    left: 0,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  textInput: {
    width: '100%',
    height: '100%',
    paddingTop: 16,
    paddingBottom: 2,
    paddingHorizontal: 0,
    fontSize: 15,
    color: '#F8FAFC',
    fontFamily: 'Inter',
  },
  textInputLight: {
    color: '#0F172A',
  },
  suffixButton: {
    paddingHorizontal: 6,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontFamily: 'Inter',
  },
});
