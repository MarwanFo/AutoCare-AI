import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useAppTheme } from '@/theme/ThemeProvider';
import { secureStore } from '@/storage/secureStore';
import { useAuthStore } from '@/stores/authStore';
import { apiClient } from '@/api/client';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { colors, spacing } = useAppTheme();
  const { setSession } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  // Input focus states for Electric Blue highlights
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Call mobile login endpoint
      const response = await apiClient.post('/api/v1/auth/mobile/login', {
        email: data.email,
        password: data.password,
      });

      const { accessToken, refreshToken, user } = response.data;

      if (!accessToken || !refreshToken) {
        throw new Error('Invalid token payload returned from server');
      }

      // Persist to SecureStore
      await secureStore.setItem('access_token', accessToken);
      await secureStore.setItem('refresh_token', refreshToken);

      // Save user profile state in Zustand store, transitioning to App navigation automatically
      setSession(accessToken, user);
    } catch (error: any) {
      console.error('Login error details:', error);

      if (error.response) {
        // Backend returned response (e.g. 400 Bad Request, 401 Unauthorized)
        const serverError = error.response.data;
        const message = serverError?.message || serverError?.error || 'Invalid credentials or validation failed';
        setErrorMessage(message);
      } else if (error.request) {
        // Request made but no response (Network error)
        setErrorMessage('Network error. Please check your internet connection and try again.');
      } else {
        // Something else went wrong
        setErrorMessage(error.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* Brand Header */}
          <Text style={[styles.brandTitle, { color: colors.text }]}>AutoCare AI</Text>
          <Text style={[styles.brandSubtitle, { color: colors.textSecondary }]}>
            Welcome back. Your vehicle's health is our priority.
          </Text>

          {/* Backend Error Banner */}
          {errorMessage && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          )}

          {/* Form Fields */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>EMAIL ADDRESS</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      backgroundColor: colors.backgroundElement,
                      borderColor: errors.email
                        ? '#ffb4ab'
                        : isEmailFocused
                        ? '#2f80ed'
                        : '#333333',
                    },
                  ]}
                  placeholder="Enter email"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => {
                    setIsEmailFocused(false);
                    onBlur();
                  }}
                  onChangeText={onChange}
                  value={value}
                  editable={!isLoading}
                />
              )}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
          </View>

          <View style={styles.formGroup}>
            <View style={styles.passwordHeader}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>PASSWORD</Text>
              <TouchableOpacity
                onPress={() => setSecureTextEntry((prev) => !prev)}
                accessibilityRole="button"
                accessibilityLabel={secureTextEntry ? 'Show password' : 'Hide password'}
              >
                <Text style={[styles.toggleText, { color: '#2f80ed' }]}>
                  {secureTextEntry ? 'Show' : 'Hide'}
                </Text>
              </TouchableOpacity>
            </View>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      backgroundColor: colors.backgroundElement,
                      borderColor: errors.password
                        ? '#ffb4ab'
                        : isPasswordFocused
                        ? '#2f80ed'
                        : '#333333',
                    },
                  ]}
                  placeholder="Enter password"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry={secureTextEntry}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => {
                    setIsPasswordFocused(false);
                    onBlur();
                  }}
                  onChangeText={onChange}
                  value={value}
                  editable={!isLoading}
                />
              )}
            />
            {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={[
              styles.primaryButton,
              {
                backgroundColor: colors.text, // White in dark mode, black in light mode
                opacity: isLoading ? 0.7 : 1,
              },
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityState={{ disabled: isLoading }}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={[styles.primaryButtonText, { color: colors.background }]}>Log In</Text>
            )}
          </TouchableOpacity>

          {/* Footer Navigation place-holders */}
          <View style={styles.footer}>
            <TouchableOpacity accessibilityRole="button">
              <Text style={[styles.footerLink, { color: '#2f80ed' }]}>Forgot password?</Text>
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button">
              <Text style={[styles.footerLink, { color: colors.textSecondary }]}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  card: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#333333',
    backgroundColor: '#131313',
  },
  brandTitle: {
    fontSize: 28,
    fontFamily: 'Inter',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  brandSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  errorBanner: {
    backgroundColor: '#93000a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorBannerText: {
    color: '#ffdad6',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: 20,
    alignSelf: 'stretch',
  },
  label: {
    fontSize: 12,
    fontFamily: 'JetBrains Mono',
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 12,
    fontFamily: 'Inter',
    fontWeight: '600',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: 'Inter',
  },
  errorText: {
    color: '#ffb4ab',
    fontSize: 12,
    marginTop: 6,
    fontFamily: 'Inter',
  },
  primaryButton: {
    height: 48,
    borderRadius: 9999, // Pill shaped
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  primaryButtonText: {
    fontSize: 15,
    fontFamily: 'Inter',
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  footerLink: {
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '500',
  },
});
