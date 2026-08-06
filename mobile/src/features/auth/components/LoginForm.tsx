import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Control, Controller, FieldErrors, UseFormHandleSubmit } from 'react-hook-form';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { FloatingInput, MailIcon, PasswordInput } from './PasswordInput';
import { PrimaryButton } from './PrimaryButton';
import { useAppTranslation } from '@/i18n/hooks/useAppTranslation';

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginFormProps {
  control: Control<LoginFormData>;
  errors: FieldErrors<LoginFormData>;
  isLoading: boolean;
  handleSubmit: UseFormHandleSubmit<LoginFormData>;
  onSubmit: (data: LoginFormData) => void;
  onForgotPassword: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Multicolor Google Branding SVG Icon
function GoogleIcon() {
  return (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </Svg>
  );
}

// Custom Checkbox Vector Icon
function CheckboxIcon({ checked }: { checked: boolean }) {
  if (!checked) return null;
  return (
    <Svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17Z"
        fill="#131313"
      />
    </Svg>
  );
}

export function LoginForm({
  control,
  errors,
  isLoading,
  handleSubmit,
  onSubmit,
  onForgotPassword,
}: LoginFormProps) {
  const { t } = useAppTranslation(['auth', 'common']);
  const googleBtnScale = useSharedValue(1);

  // Google button active spring press animation
  const googleBtnStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: googleBtnScale.value }],
    };
  });

  const handleGooglePressIn = () => {
    googleBtnScale.value = withSpring(0.98, { damping: 10, stiffness: 200 });
  };

  const handleGooglePressOut = () => {
    googleBtnScale.value = withSpring(1.0, { damping: 10, stiffness: 200 });
  };

  return (
    <View style={styles.container}>
      {/* Email Input Field */}
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <FloatingInput
            label={t('auth:email_label')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.email?.message as string}
            editable={!isLoading}
            keyboardType="email-address"
            prefixIcon={<MailIcon color={errors.email ? '#ffb4ab' : '#c4c7c8'} />}
          />
        )}
      />

      {/* Password Input Field */}
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <PasswordInput
            label={t('auth:password_label')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.password?.message as string}
            editable={!isLoading}
          />
        )}
      />

      {/* Remember Me & Forgot Password Row */}
      <View style={styles.rememberForgotRow}>
        <Controller
          control={control}
          name="rememberMe"
          render={({ field: { onChange, value } }) => (
            <Pressable
              style={styles.checkboxContainer}
              onPress={() => onChange(!value)}
              disabled={isLoading}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: !!value }}
              accessibilityLabel={t('auth:remember_me')}
            >
              <View
                style={[
                  styles.checkbox,
                  value && { backgroundColor: '#abc7ff', borderColor: '#abc7ff' },
                ]}
              >
                <CheckboxIcon checked={!!value} />
              </View>
              <Text style={styles.rememberText}>{t('auth:remember_me')}</Text>
            </Pressable>
          )}
        />

        <Pressable
          accessibilityRole="link"
          accessibilityLabel={t('auth:forgot_password_link')}
          disabled={isLoading}
          onPress={onForgotPassword}
        >
          <Text style={styles.forgotText}>{t('auth:forgot_password_link')}</Text>
        </Pressable>
      </View>

      {/* Action CTA Buttons */}
      <View style={styles.actionContainer}>
        {/* Core Login Button */}
        <PrimaryButton
          title={t('auth:sign_in_button')}
          isLoading={isLoading}
          onPress={handleSubmit(onSubmit)}
        />

        {/* Google Authentication Button */}
        <AnimatedPressable
          style={[styles.googleButton, googleBtnStyle]}
          onPressIn={handleGooglePressIn}
          onPressOut={handleGooglePressOut}
          disabled={isLoading}
          accessibilityRole="button"
          accessibilityLabel={t('auth:continue_with_google')}
        >
          <View style={styles.googleContent}>
            <GoogleIcon />
            <Text style={styles.googleText}>{t('auth:continue_with_google')}</Text>
          </View>
        </AnimatedPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
  },
  rememberForgotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 32,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#444748',
    backgroundColor: '#353534',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rememberText: {
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#c4c7c8',
    marginLeft: 12,
  },
  forgotText: {
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#abc7ff',
  },
  actionContainer: {
    alignSelf: 'stretch',
    gap: 16,
  },
  googleButton: {
    height: 56,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#444748',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  googleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleText: {
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '600',
    letterSpacing: 0.14,
    color: '#e5e2e1',
    marginLeft: 12,
  },
});
