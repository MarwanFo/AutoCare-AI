import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Control, Controller, FieldErrors, UseFormHandleSubmit } from 'react-hook-form';
import Svg, { Path } from 'react-native-svg';

import { FloatingInput, MailIcon, PasswordInput } from './PasswordInput';
import { PrimaryButton } from './PrimaryButton';
import { useAppTranslation } from '@/i18n/hooks/useAppTranslation';
import { useAppTheme } from '@/theme/ThemeProvider';

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

// Custom Checkbox Vector Icon
function CheckboxIcon({ checked }: { checked: boolean }) {
  if (!checked) return null;
  return (
    <Svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17Z"
        fill="#FFFFFF"
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
  const { isDark } = useAppTheme();

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
            prefixIcon={<MailIcon color={errors.email ? '#EF4444' : isDark ? '#94A3B8' : '#64748B'} />}
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
                  !isDark && styles.checkboxLight,
                  value && { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
                ]}
              >
                <CheckboxIcon checked={!!value} />
              </View>
              <Text style={[styles.rememberText, !isDark && styles.rememberTextLight]}>
                {t('auth:remember_me')}
              </Text>
            </Pressable>
          )}
        />

        <Pressable
          accessibilityRole="link"
          accessibilityLabel={t('auth:forgot_password_link')}
          disabled={isLoading}
          onPress={onForgotPassword}
        >
          <Text style={[styles.forgotText, !isDark && styles.forgotTextLight]}>
            {t('auth:forgot_password_link')}
          </Text>
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
    marginBottom: 20,
    marginTop: 2,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: '#11141B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLight: {
    borderColor: 'rgba(15, 23, 42, 0.2)',
    backgroundColor: '#F1F5F9',
  },
  rememberText: {
    fontSize: 13,
    fontFamily: 'Inter',
    color: '#94A3B8',
    marginLeft: 10,
    fontWeight: '500',
  },
  rememberTextLight: {
    color: '#475569',
  },
  forgotText: {
    fontSize: 13,
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#3B82F6',
  },
  forgotTextLight: {
    color: '#2563EB',
  },
  actionContainer: {
    alignSelf: 'stretch',
  },
});
