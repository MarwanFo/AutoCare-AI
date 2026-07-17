import React, { useEffect, useState } from 'react';
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

// Custom SVG Icons matching the Material Symbols used in Stitch
export function MailIcon({ color }: { color: string }) {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"
        fill={color}
      />
    </Svg>
  );
}

export function LockIcon({ color }: { color: string }) {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM9 6C9 4.34 10.34 3 12 3C13.66 3 15 4.34 15 6V8H9V6ZM18 20H6V10H18V20ZM12 17C13.1 17 14 16.1 14 15C14 13.9 13.1 13 12 13C10.9 13 10 13.9 10 15C10 16.1 10.9 17 12 17Z"
        fill={color}
      />
    </Svg>
  );
}

export function EyeIcon({ color, visible }: { color: string; visible: boolean }) {
  if (visible) {
    // Visibility
    return (
      <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z"
          fill={color}
        />
      </Svg>
    );
  }
  // Visibility Off
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 7C14.76 7 17 9.24 17 12C17 13.41 16.42 14.68 15.48 15.59L17.65 17.76C19.78 16.29 21.6 14.31 22.9 12C21.17 7.61 16.9 4.5 11.9 4.5C10.43 4.5 9.03 4.81 7.76 5.37L9.5 7.11C10.27 6.42 11.28 6 12 7ZM2 4.27L4.28 6.55L4.73 7C3.06 8.3 1.69 10 1 12C2.73 16.39 7 19.5 12 19.5C13.8 19.5 15.5 19.06 17 18.27L17.45 18.72L19.73 21L21 19.73L3.27 3L2 4.27ZM7.52 9.79L9.24 11.51C9.09 11.67 9 11.83 9 12C9 13.66 10.34 15 12 15C12.17 15 12.33 14.91 12.49 14.76L14.21 16.48C13.55 16.8 12.8 17 12 17C9.24 17 7 14.76 7 12C7 11.2 7.2 10.45 7.52 9.79ZM11.9 9C12.75 9 13.5 9.25 14.12 9.68L10.82 6.38C11.17 6.13 11.53 6 11.9 9ZM12 9Z"
        fill={color}
      />
    </Svg>
  );
}

interface FloatingInputProps extends TextInputProps {
  label: string;
  error?: string;
  editable?: boolean;
  prefixIcon: React.ReactNode;
  children?: React.ReactNode;
}

export function FloatingInput({
  label,
  error,
  editable = true,
  prefixIcon,
  children,
  value = '',
  onFocus,
  onBlur,
  style,
  ...props
}: FloatingInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const floatProgress = useSharedValue(value.length > 0 ? 1 : 0);

  useEffect(() => {
    // Animate label float depending on value length or focus state
    const shouldFloat = isFocused || value.length > 0;
    floatProgress.value = withTiming(shouldFloat ? 1 : 0, { duration: 200 });
  }, [isFocused, value]);

  // Label animated styles (shifts from middle top-4 to high top-1, and scales text down)
  const animatedLabelStyle = useAnimatedStyle(() => {
    const top = interpolate(floatProgress.value, [0, 1], [14, -2]);
    const fontSize = interpolate(floatProgress.value, [0, 1], [16, 11]);
    const color = interpolateColor(
      floatProgress.value,
      [0, 1],
      ['#c4c7c8', isFocused ? '#abc7ff' : '#c4c7c8']
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
        style={[
          styles.container,
          {
            borderColor: error
              ? '#ffb4ab' // error
              : isFocused
              ? '#abc7ff' // secondary
              : '#444748', // outline-variant
          },
        ]}
      >
        {/* Left Prefix Icon */}
        <View style={styles.prefixContainer}>
          {prefixIcon}
        </View>

        {/* Input & Floating Label Area */}
        <View style={styles.inputArea}>
          <Animated.Text
            style={[
              styles.floatingLabel,
              props.secureTextEntry ? { fontFamily: 'Inter' } : { fontFamily: 'JetBrains Mono' },
              animatedLabelStyle,
            ]}
            pointerEvents="none"
          >
            {label}
          </Animated.Text>
          <TextInput
            style={[styles.textInput, style]}
            value={value}
            editable={editable}
            autoCapitalize="none"
            autoCorrect={false}
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
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  return (
    <FloatingInput
      label={label}
      error={error}
      editable={editable}
      secureTextEntry={secureTextEntry}
      prefixIcon={<LockIcon color={error ? '#ffb4ab' : '#c4c7c8'} />}
      {...props}
    >
      {/* Suffix password toggle button */}
      <TouchableOpacity
        style={styles.suffixButton}
        onPress={() => setSecureTextEntry((prev) => !prev)}
        disabled={!editable}
        accessibilityRole="button"
        accessibilityLabel={secureTextEntry ? 'Show password' : 'Hide password'}
      >
        <EyeIcon
          color={error ? '#ffb4ab' : '#c4c7c8'}
          visible={!secureTextEntry}
        />
      </TouchableOpacity>
    </FloatingInput>
  );
}

// Wrap target components inside container styles
const styles = StyleSheet.create({
  outerContainer: {
    alignSelf: 'stretch',
    marginBottom: 24, // spacing.baseline * 3 = 24px
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131313', // bg-surface = #131313
    borderRadius: 16, // rounded-md = 16px
    paddingHorizontal: 16,
    paddingVertical: 10,
    height: 64, // input height matching label + text input fields
    borderBottomWidth: 2, // input-underline = 2px bottom border
  },
  prefixContainer: {
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputArea: {
    flex: 1,
    height: '100%',
    position: 'relative',
    justifyContent: 'flex-end',
  },
  floatingLabel: {
    position: 'absolute',
    left: 0,
    fontWeight: '500',
  },
  textInput: {
    height: 32,
    fontSize: 16,
    color: '#e5e2e1', // text-on-surface = #e5e2e1
    padding: 0,
    fontFamily: 'Inter',
  },
  suffixButton: {
    paddingLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#ffb4ab', // error
    fontSize: 12,
    marginTop: 6,
    fontFamily: 'Inter',
  },
});
