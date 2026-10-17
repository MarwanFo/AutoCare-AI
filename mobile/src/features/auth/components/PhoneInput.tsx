import React, { useEffect, useRef, useState } from 'react';
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
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <Path
        d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
        fill={color}
      />
    </Svg>
  );
}

// Chevron Down Icon for dropdown trigger
function ChevronDownIcon({ color }: { color: string }) {
  return (
    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <Path
        d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"
        fill={color}
      />
    </Svg>
  );
}

// Supported Country Codes with priority for Morocco
const COUNTRIES = [
  { code: '+212', flag: '🇲🇦', name: 'Morocco' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+1', flag: '🇺🇸', name: 'United States / Canada' },
  { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: '+34', flag: '🇪🇸', name: 'Spain' },
  { code: '+971', flag: '🇦🇪', name: 'United Arab Emirates' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
];

interface PhoneInputProps extends Omit<TextInputProps, 'onChangeText' | 'value'> {
  label: string;
  value?: string;
  error?: string;
  editable?: boolean;
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
  const inputRef = useRef<TextInput>(null);

  // Parse incoming value to find the country code and local number
  const matchedCountry = COUNTRIES.find((c) => value.startsWith(c.code)) || COUNTRIES[0];
  const [selectedCountry, setSelectedCountry] = useState(matchedCountry);

  const getLocalPart = (val: string, countryCode: string) => {
    if (val.startsWith(countryCode)) {
      return val.slice(countryCode.length);
    }
    return val.startsWith('+') ? '' : val;
  };

  const initialLocal = getLocalPart(value, selectedCountry.code);
  const [localNumber, setLocalNumber] = useState(initialLocal);

  useEffect(() => {
    const freshCountry = COUNTRIES.find((c) => value.startsWith(c.code));
    if (freshCountry) {
      setSelectedCountry(freshCountry);
      setLocalNumber(getLocalPart(value, freshCountry.code));
    } else {
      setLocalNumber(value.startsWith('+') ? '' : value);
    }
  }, [value]);

  const floatProgress = useSharedValue(initialLocal.length > 0 ? 1 : 0);

  useEffect(() => {
    const shouldFloat = isFocused || localNumber.length > 0;
    floatProgress.value = withTiming(shouldFloat ? 1 : 0, { duration: 180 });
  }, [isFocused, localNumber]);

  const animatedLabelStyle = useAnimatedStyle(() => {
    const top = interpolate(floatProgress.value, [0, 1], [17, 7]);
    const fontSize = interpolate(floatProgress.value, [0, 1], [15, 11]);
    const color = interpolateColor(
      floatProgress.value,
      [0, 1],
      ['#64748B', isFocused ? '#3B82F6' : '#94A3B8']
    );

    return {
      top,
      fontSize,
      color,
    };
  });

  const cleanLocal = (text: string) => {
    return text.replace(/\D/g, '');
  };

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
              : 'rgba(255, 255, 255, 0.08)',
            backgroundColor: isFocused ? '#181D2A' : '#11141B',
          },
          isFocused && styles.containerFocused,
        ]}
      >
        {/* Left Phone Icon */}
        <View style={styles.prefixContainer} pointerEvents="none">
          <PhoneIcon color={error ? '#EF4444' : isFocused ? '#3B82F6' : '#94A3B8'} />
        </View>

        {/* Country Code Trigger */}
        <TouchableOpacity
          style={styles.countrySelector}
          onPress={() => editable && setModalVisible(true)}
          disabled={!editable}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Select country code"
        >
          <Text style={styles.countryText}>
            {selectedCountry.flag} {selectedCountry.code}
          </Text>
          <ChevronDownIcon color="#94A3B8" />
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
            ref={inputRef}
            style={styles.textInput}
            value={localNumber}
            onChangeText={handleTextChange}
            editable={editable}
            keyboardType="phone-pad"
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
            <Text style={styles.modalTitle}>Select Country Code</Text>
            <FlatList
              data={COUNTRIES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryRow}
                  activeOpacity={0.7}
                  onPress={() => handleCountrySelect(item)}
                >
                  <Text style={styles.countryRowText}>
                    {item.flag} {item.name} ({item.code})
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
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    marginRight: 8,
  },
  countryText: {
    fontSize: 14,
    color: '#F8FAFC',
    marginRight: 4,
    fontFamily: 'Inter',
    fontWeight: '600',
  },
  divider: {
    width: 1,
    height: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginRight: 10,
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
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontFamily: 'Inter',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#141824',
    borderRadius: 20,
    padding: 22,
    width: '100%',
    maxHeight: '70%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 16,
    fontFamily: 'Inter',
  },
  countryRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  countryRowText: {
    fontSize: 15,
    color: '#F8FAFC',
    fontFamily: 'Inter',
  },
});
