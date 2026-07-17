import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
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

// Custom Phone Icon
function PhoneIcon({ color }: { color: string }) {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
        fill={color}
      />
    </Svg>
  );
}

// Custom Chevron Down Icon
function ChevronDownIcon({ color }: { color: string }) {
  return (
    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <Path
        d="M7 10l5 5 5-5H7z"
        fill={color}
      />
    </Svg>
  );
}

const COUNTRIES = [
  { code: '+212', flag: '🇲🇦', name: 'Morocco' },
  { code: '+1', flag: '🇺🇸', name: 'United States / Canada' },
  { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+971', flag: '🇦🇪', name: 'United Arab Emirates' },
];

interface PhoneInputProps extends Omit<TextInputProps, 'onChangeText' | 'value'> {
  label: string;
  error?: string;
  editable?: boolean;
  value?: string; // E.164 format (e.g., +212612345678)
  onChangeText: (e164Value: string) => void;
}

export function PhoneInput({
  label,
  error,
  editable = true,
  value = '',
  onChangeText,
  onFocus,
  onBlur,
  style,
  ...props
}: PhoneInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Parse incoming value to find the country code and local number
  const matchedCountry = COUNTRIES.find((c) => value.startsWith(c.code)) || COUNTRIES[0];
  const [selectedCountry, setSelectedCountry] = useState(matchedCountry);

  // Derive local number (e.g. if E.164 is +212612345678, local is 612345678)
  const getLocalPart = (val: string, countryCode: string) => {
    if (val.startsWith(countryCode)) {
      return val.slice(countryCode.length);
    }
    return val.startsWith('+') ? '' : val;
  };

  const initialLocal = getLocalPart(value, selectedCountry.code);
  const [localNumber, setLocalNumber] = useState(initialLocal);

  // Update internal states when external value changes
  useEffect(() => {
    const freshCountry = COUNTRIES.find((c) => value.startsWith(c.code));
    if (freshCountry) {
      setSelectedCountry(freshCountry);
      setLocalNumber(getLocalPart(value, freshCountry.code));
    } else {
      // If empty or non-matching, keep current country selection and set local
      setLocalNumber(value.startsWith('+') ? '' : value);
    }
  }, [value]);

  const floatProgress = useSharedValue(initialLocal.length > 0 ? 1 : 0);

  useEffect(() => {
    const shouldFloat = isFocused || localNumber.length > 0;
    floatProgress.value = withTiming(shouldFloat ? 1 : 0, { duration: 200 });
  }, [isFocused, localNumber]);

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

  // Strip non-digits and leading zero
  const cleanLocal = (text: string) => {
    return text.replace(/\D/g, '');
  };

  // Basic space-separated grouping for visual formatting
  const formatVisual = (text: string) => {
    const cleaned = cleanLocal(text);
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    } else {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 15)}`;
    }
  };

  const handleTextChange = (text: string) => {
    const formatted = formatVisual(text);
    setLocalNumber(formatted);

    // Normalize to E.164 format: country code + local number (strip leading 0)
    let cleanedPart = cleanLocal(text);
    if (cleanedPart.startsWith('0')) {
      cleanedPart = cleanedPart.slice(1);
    }

    const e164 = cleanedPart ? `${selectedCountry.code}${cleanedPart}` : '';
    onChangeText(e164);
  };

  const handleCountrySelect = (country: typeof COUNTRIES[0]) => {
    setSelectedCountry(country);
    setModalVisible(false);

    // Propagate new E.164 value to parent
    let cleanedPart = cleanLocal(localNumber);
    if (cleanedPart.startsWith('0')) {
      cleanedPart = cleanedPart.slice(1);
    }

    const e164 = cleanedPart ? `${country.code}${cleanedPart}` : '';
    onChangeText(e164);
  };

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
        {/* Left Phone Icon */}
        <View style={styles.prefixContainer}>
          <PhoneIcon color={error ? '#ffb4ab' : '#c4c7c8'} />
        </View>

        {/* Country Code Trigger */}
        <TouchableOpacity
          style={styles.countrySelector}
          onPress={() => editable && setModalVisible(true)}
          disabled={!editable}
          accessibilityRole="button"
          accessibilityLabel="Select country code"
        >
          <Text style={styles.countryText}>
            {selectedCountry.flag} {selectedCountry.code}
          </Text>
          <ChevronDownIcon color="#c4c7c8" />
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Input & Floating Label Area */}
        <View style={styles.inputArea}>
          <Animated.Text
            style={[styles.floatingLabel, animatedLabelStyle]}
            pointerEvents="none"
          >
            {label}
          </Animated.Text>
          <TextInput
            style={styles.textInput}
            value={localNumber}
            onChangeText={handleTextChange}
            editable={editable}
            keyboardType="phone-pad"
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
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Country Selection Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Country</Text>
            <FlatList
              data={COUNTRIES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryRow}
                  onPress={() => handleCountrySelect(item)}
                >
                  <Text style={styles.countryRowText}>
                    {item.flag}  {item.name} ({item.code})
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    alignSelf: 'stretch',
    marginBottom: 24,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131313',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    height: 64,
    borderBottomWidth: 2,
  },
  prefixContainer: {
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    marginRight: 12,
  },
  countryText: {
    fontSize: 16,
    color: '#e5e2e1',
    marginRight: 4,
    fontFamily: 'Inter',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#444748',
    marginRight: 12,
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
    fontFamily: 'Inter',
  },
  textInput: {
    height: 32,
    fontSize: 16,
    color: '#e5e2e1',
    padding: 0,
    fontFamily: 'Inter',
  },
  errorText: {
    color: '#ffb4ab',
    fontSize: 12,
    marginTop: 6,
    fontFamily: 'Inter',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#201f1f',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxHeight: '70%',
    borderWidth: 1,
    borderColor: '#353534',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
    fontFamily: 'Inter',
  },
  countryRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#353534',
  },
  countryRowText: {
    fontSize: 16,
    color: '#e5e2e1',
    fontFamily: 'Inter',
  },
});
