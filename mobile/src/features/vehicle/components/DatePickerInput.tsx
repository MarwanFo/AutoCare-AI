import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useLanguage } from '@/i18n/hooks/useLanguage';
import { useAppTranslation } from '@/i18n/hooks/useAppTranslation';

interface DatePickerInputProps {
  label: string;
  value?: string; // YYYY-MM-DD format
  onChange: (isoDate: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  maxDate?: Date;
}

const MONTH_NAMES = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
};

const WEEKDAY_NAMES = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  fr: ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'],
  ar: ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'],
};

export function DatePickerInput({
  label,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  maxDate = new Date(),
}: DatePickerInputProps) {
  const { t } = useAppTranslation(['garage', 'common']);
  const { currentLanguage, isRTL } = useLanguage();
  const langKey = (currentLanguage === 'ar' || currentLanguage === 'fr') ? currentLanguage : 'en';

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Parse current value (YYYY-MM-DD) into Date object or fallback to today
  const parseIsoDate = (isoStr?: string): Date => {
    if (!isoStr || !/^\d{4}-\d{2}-\d{2}$/.test(isoStr)) return new Date();
    const [y, m, d] = isoStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const currentDateObj = parseIsoDate(value);
  const [viewYear, setViewYear] = useState(currentDateObj.getFullYear());
  const [viewMonth, setViewMonth] = useState(currentDateObj.getMonth());
  const [showYearSelector, setShowYearSelector] = useState(false);

  const handleOpen = () => {
    if (disabled) return;
    const d = parseIsoDate(value);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    setShowYearSelector(false);
    setIsModalOpen(true);
  };

  // Helper to format ISO string YYYY-MM-DD
  const formatToIso = (year: number, month: number, day: number): string => {
    const yyyy = String(year);
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Format date for UI display based on language
  const getFormattedDisplayDate = (): string => {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return placeholder || t('garage:onboarding.select_purchase_date_placeholder', { defaultValue: 'Select acquisition date' });
    }
    const [y, m, d] = value.split('-').map(Number);
    const monthName = MONTH_NAMES[langKey][m - 1] || MONTH_NAMES.en[m - 1];
    
    if (langKey === 'ar') {
      return `${d} ${monthName} ${y}`;
    }
    if (langKey === 'fr') {
      return `${d} ${monthName} ${y}`;
    }
    return `${monthName} ${d}, ${y}`;
  };

  // Calendar math
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const handleDaySelect = (day: number) => {
    const selectedDate = new Date(viewYear, viewMonth, day);
    // Check future date boundary
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    if (selectedDate > today) return;

    const isoStr = formatToIso(viewYear, viewMonth, day);
    onChange(isoStr);
    setIsModalOpen(false);
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    const today = new Date();
    if (viewYear > today.getFullYear() || (viewYear === today.getFullYear() && viewMonth >= today.getMonth())) {
      return; // Cannot navigate beyond current month
    }
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const yearsList = Array.from({ length: 35 }, (_, i) => new Date().getFullYear() - i);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, isRTL && styles.textRight]}>
        {label}
        {required && <Text style={styles.requiredAsterisk}> *</Text>}
      </Text>

      <TouchableOpacity
        style={[
          styles.inputCard,
          isRTL && styles.rowReverse,
          !!value && styles.inputCardActive,
          !!error && styles.inputCardError,
          disabled && styles.inputCardDisabled,
        ]}
        onPress={handleOpen}
        activeOpacity={0.8}
        disabled={disabled}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={placeholder}
      >
        <View style={styles.iconContainer}>
          <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <Path
              d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"
              fill={error ? '#ffb4ab' : value ? '#abc7ff' : '#8e9192'}
            />
          </Svg>
        </View>

        <Text
          style={[
            styles.valueText,
            !value && styles.placeholderText,
            isRTL && styles.textRight,
          ]}
          numberOfLines={1}
        >
          {getFormattedDisplayDate()}
        </Text>

        <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <Path d="M7 10l5 5 5-5H7z" fill="#8e9192" />
        </Svg>

        {/* Native HTML5 date input overlay for Expo Web */}
        {Platform.OS === 'web' && !disabled && (
          <input
            type="date"
            max={new Date().toISOString().split('T')[0]}
            value={value || ''}
            onChange={(e) => {
              if (e.target.value) {
                onChange(e.target.value);
              }
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0,
              cursor: 'pointer',
              width: '100%',
              height: '100%',
            }}
          />
        )}
      </TouchableOpacity>

      {error && <Text style={[styles.errorText, isRTL && styles.textRight]}>{error}</Text>}

      {/* Cross-Platform Calendar Picker Modal */}
      <Modal
        visible={isModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsModalOpen(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <View style={[styles.modalHeader, isRTL && styles.rowReverse]}>
              <TouchableOpacity
                onPress={() => setShowYearSelector(!showYearSelector)}
                style={styles.monthYearTitleBtn}
              >
                <Text style={styles.monthYearTitle}>
                  {MONTH_NAMES[langKey][viewMonth]} {viewYear}
                </Text>
                <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <Path d="M7 10l5 5 5-5H7z" fill="#abc7ff" />
                </Svg>
              </TouchableOpacity>

              <View style={styles.monthNavRow}>
                <TouchableOpacity style={styles.navBtn} onPress={handlePrevMonth}>
                  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <Path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="#abc7ff" />
                  </Svg>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.navBtn}
                  onPress={handleNextMonth}
                  disabled={
                    viewYear === new Date().getFullYear() && viewMonth >= new Date().getMonth()
                  }
                >
                  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"
                      fill={
                        viewYear === new Date().getFullYear() && viewMonth >= new Date().getMonth()
                          ? '#444'
                          : '#abc7ff'
                      }
                    />
                  </Svg>
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick Year Selector Dropdown Grid */}
            {showYearSelector ? (
              <ScrollView style={styles.yearScrollView} contentContainerStyle={styles.yearGrid}>
                {yearsList.map((y) => (
                  <TouchableOpacity
                    key={y}
                    style={[styles.yearItem, y === viewYear && styles.yearItemActive]}
                    onPress={() => {
                      setViewYear(y);
                      setShowYearSelector(false);
                    }}
                  >
                    <Text style={[styles.yearItemText, y === viewYear && styles.yearItemTextActive]}>
                      {y}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <>
                {/* Weekday Header */}
                <View style={[styles.weekdayRow, isRTL && styles.rowReverse]}>
                  {WEEKDAY_NAMES[langKey].map((dayName) => (
                    <Text key={dayName} style={styles.weekdayText}>
                      {dayName}
                    </Text>
                  ))}
                </View>

                {/* Days Grid */}
                <View style={styles.daysGrid}>
                  {/* Empty offset padding for first day of month */}
                  {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                    <View key={`empty-${idx}`} style={styles.dayCell} />
                  ))}

                  {/* Days numbers */}
                  {Array.from({ length: daysInMonth }).map((_, idx) => {
                    const day = idx + 1;
                    const dateObj = new Date(viewYear, viewMonth, day);
                    const today = new Date();
                    today.setHours(23, 59, 59, 999);

                    const isFuture = dateObj > today;
                    const selectedIso = value;
                    const thisIso = formatToIso(viewYear, viewMonth, day);
                    const isSelected = selectedIso === thisIso;

                    return (
                      <TouchableOpacity
                        key={day}
                        style={[
                          styles.dayCell,
                          isSelected && styles.dayCellSelected,
                          isFuture && styles.dayCellDisabled,
                        ]}
                        onPress={() => handleDaySelect(day)}
                        disabled={isFuture}
                      >
                        <Text
                          style={[
                            styles.dayText,
                            isSelected && styles.dayTextSelected,
                            isFuture && styles.dayTextDisabled,
                          ]}
                        >
                          {day}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}

            {/* Modal Actions Footer */}
            <View style={[styles.modalFooter, isRTL && styles.rowReverse]}>
              {value && (
                <TouchableOpacity
                  style={styles.clearBtn}
                  onPress={() => {
                    onChange('');
                    setIsModalOpen(false);
                  }}
                >
                  <Text style={styles.clearBtnText}>
                    {t('garage:onboarding.clear_date', { defaultValue: 'Clear' })}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setIsModalOpen(false)}
              >
                <Text style={styles.closeBtnText}>
                  {t('common:cancel', { defaultValue: 'Cancel' })}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#c4c7c8',
    marginBottom: 6,
    fontFamily: 'Inter',
  },
  requiredAsterisk: {
    color: '#f87171',
  },
  textRight: {
    textAlign: 'right',
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1c1c',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2f3131',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    position: 'relative',
  },
  inputCardActive: {
    borderColor: '#abc7ff',
    backgroundColor: '#192233',
  },
  inputCardError: {
    borderColor: '#ffb4ab',
  },
  inputCardDisabled: {
    opacity: 0.5,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    fontFamily: 'Inter',
  },
  placeholderText: {
    color: '#8e9192',
  },
  errorText: {
    fontSize: 12,
    color: '#ffb4ab',
    marginTop: 4,
    fontFamily: 'Inter',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#18181b',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#27272a',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthYearTitleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  monthYearTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: 'Inter',
  },
  monthNavRow: {
    flexDirection: 'row',
    gap: 8,
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#27272a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  weekdayText: {
    width: 38,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#8e9192',
    fontFamily: 'Inter',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 8,
  },
  dayCell: {
    width: '14.28%',
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  dayCellSelected: {
    backgroundColor: '#abc7ff',
  },
  dayCellDisabled: {
    opacity: 0.25,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    fontFamily: 'Inter',
  },
  dayTextSelected: {
    color: '#131313',
    fontWeight: '700',
  },
  dayTextDisabled: {
    color: '#666',
  },
  yearScrollView: {
    maxHeight: 220,
  },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  yearItem: {
    width: 70,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#27272a',
    alignItems: 'center',
  },
  yearItemActive: {
    backgroundColor: '#abc7ff',
  },
  yearItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e4e4e7',
    fontFamily: 'Inter',
  },
  yearItemTextActive: {
    color: '#131313',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#27272a',
  },
  clearBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  clearBtnText: {
    color: '#f87171',
    fontWeight: '600',
    fontSize: 13,
    fontFamily: 'Inter',
  },
  closeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#27272a',
    borderRadius: 8,
  },
  closeBtnText: {
    color: '#e4e4e7',
    fontWeight: '600',
    fontSize: 13,
    fontFamily: 'Inter',
  },
});
