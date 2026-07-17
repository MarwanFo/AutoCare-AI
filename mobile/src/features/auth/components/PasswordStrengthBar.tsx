import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface PasswordStrengthBarProps {
  password?: string;
}

export function PasswordStrengthBar({ password = '' }: PasswordStrengthBarProps) {
  // Score password complexity from 0 to 4
  const getPasswordStrength = () => {
    if (!password) return { score: 0, text: '', color: '#444748' };

    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[@$!%*?&#]/.test(password)) score++;

    switch (score) {
      case 1:
        return { score, text: 'Weak', color: '#ffb4ab' }; // error red
      case 2:
        return { score, text: 'Fair', color: '#f3b064' }; // orange
      case 3:
        return { score, text: 'Good', color: '#e5e2e1' }; // light grey/cream
      case 4:
        return { score, text: 'Strong', color: '#88c8a1' }; // green
      default:
        return { score: 0, text: '', color: '#444748' };
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
                  backgroundColor: isActive ? color : '#353534', // active color or grey surface-variant
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
    marginTop: -8,
    marginBottom: 20,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: 4,
    marginBottom: 8,
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
    color: '#8e9192', // outline color
    lineHeight: 16,
  },
});
