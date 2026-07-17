import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Control, Controller, FieldErrors, UseFormHandleSubmit } from 'react-hook-form';
import Svg, { Path } from 'react-native-svg';

import { FloatingInput, MailIcon, PasswordInput } from './PasswordInput';
import { PasswordStrengthBar } from './PasswordStrengthBar';
import { PhoneInput } from './PhoneInput';
import { PrimaryButton } from './PrimaryButton';

export interface RegisterFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

interface RegisterFormProps {
  control: Control<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
  isLoading: boolean;
  handleSubmit: UseFormHandleSubmit<RegisterFormData>;
  onSubmit: (data: RegisterFormData) => void;
  watchedPassword?: string;
}

// Custom Person / User Avatar SVG Icon
function PersonIcon({ color }: { color: string }) {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
        fill={color}
      />
    </Svg>
  );
}

export function RegisterForm({
  control,
  errors,
  isLoading,
  handleSubmit,
  onSubmit,
  watchedPassword = '',
}: RegisterFormProps) {
  return (
    <View style={styles.container}>
      {/* Full Name Input Field */}
      <Controller
        control={control}
        name="fullName"
        render={({ field: { onChange, onBlur, value } }) => (
          <FloatingInput
            label="Full Name"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.fullName?.message as string}
            editable={!isLoading}
            autoCapitalize="words"
            prefixIcon={<PersonIcon color={errors.fullName ? '#ffb4ab' : '#c4c7c8'} />}
          />
        )}
      />

      {/* Email Input Field */}
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <FloatingInput
            label="Email Address"
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

      {/* Phone Number Input Field */}
      <Controller
        control={control}
        name="phoneNumber"
        render={({ field: { onChange, onBlur, value } }) => (
          <PhoneInput
            label="Phone Number"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.phoneNumber?.message as string}
            editable={!isLoading}
          />
        )}
      />

      {/* Password Input Field */}
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <PasswordInput
            label="Password"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.password?.message as string}
            editable={!isLoading}
          />
        )}
      />

      {/* Interactive Password Strength Indicator */}
      <PasswordStrengthBar password={watchedPassword} />

      {/* Confirm Password Input Field */}
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <PasswordInput
            label="Confirm Password"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.confirmPassword?.message as string}
            editable={!isLoading}
          />
        )}
      />

      {/* Register Submit Button */}
      <View style={styles.actionContainer}>
        <PrimaryButton
          title="Create Account"
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
  actionContainer: {
    alignSelf: 'stretch',
    marginTop: 8,
  },
});
