import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/theme/ThemeProvider';

interface PasswordStrengthBarProps {
  password?: string;
}

export function PasswordStrengthBar({ password = '' }: PasswordStrengthBarProps) {
  const { isDark } = useAppTheme();

  // Score password complexity from 0 to 4
  const getPasswordStrength = () => {
    if (!password) return { score: 0, text: '', color: isDark ? '#444748' : '#94A3B8' };

    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[@$!%*?&#]/.test(password)) score++;

    switch (score) {
      case 1:
        return { score, text: 'Weak', color: '#EF4444' };
      case 2:
        return { score, text: 'Fair', color: '#F59E0B' };
      case 3:
        return { score, text: 'Good', color: '#3B82F6' };
      case 4:
        return { score, text: 'Strong', color: '#10B981' };
      default:
        return { score: 0, text: '', color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.1)' };
    }
  };

  const { score, text, color } = getPasswordStrength();

  return (
    <View style={styles.container}>
      {/* 4 horizontal strength indicator bars */}
      <View style={styles.barRow}>
        {[1, 2, 3, 4].map((index) => {
          const isActive = score >= index;
          return (
            <View
              key={index}
              style={[
                styles.barSegment,
                {
                  backgroundColor: isActive
                    ? color
                    : isDark
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(15, 23, 42, 0.08)',
                },
              ]}
            />
          );
        })}
      </View>

      {/* Strength indicator text */}
      {text ? (
        <Text style={[styles.strengthText, { color }]}>
          Password strength: {text}
        </Text>
      ) : null}

      {/* Hints label */}
      <Text style={styles.hintsText}>
        Must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    marginTop: -4,
    marginBottom: 16,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: 4,
    marginBottom: 6,
  },
  barSegment: {
    flex: 1,
    height: '100%',
    borderRadius: 2,
    marginHorizontal: 2,
  },
  strengthText: {
    fontSize: 12,
    fontFamily: 'Inter',
    fontWeight: '600',
    marginBottom: 4,
  },
  hintsText: {
    fontSize: 11,
    fontFamily: 'Inter',
    color: '#64748B',
    lineHeight: 15,
  },
});
