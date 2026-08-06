import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  ScrollView,
  Switch,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useAppTranslation } from '@/i18n/hooks/useAppTranslation';
import { useRTL } from '@/i18n/hooks/useRTL';
import { useAddInterval } from '@/hooks/vehicle/useVehicleMutations';

interface AddIntervalModalProps {
  vehicleId: string;
  visible: boolean;
  onClose: () => void;
}

export function AddIntervalModal({ vehicleId, visible, onClose }: AddIntervalModalProps) {
  const { t } = useAppTranslation(['maintenance', 'common']);
  const { isRTL } = useRTL();
  const addIntervalMutation = useAddInterval(vehicleId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [intervalMileage, setIntervalMileage] = useState('');
  const [intervalMonths, setIntervalMonths] = useState('');
  const [isInspectionOnly, setIsInspectionOnly] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setErrorMsg(t('common:required', { defaultValue: 'Title is required' }));
      return;
    }
    setErrorMsg(null);

    const mileage = intervalMileage.trim() ? parseInt(intervalMileage, 10) : undefined;
    const months = intervalMonths.trim() ? parseInt(intervalMonths, 10) : undefined;

    try {
      await addIntervalMutation.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        intervalMileage: mileage && !isNaN(mileage) ? mileage : undefined,
        intervalMonths: months && !isNaN(months) ? months : undefined,
        isInspectionOnly,
      });
      setTitle('');
      setDescription('');
      setIntervalMileage('');
      setIntervalMonths('');
      setIsInspectionOnly(false);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || t('common:error', { defaultValue: 'Failed to add interval' }));
    }
  };

  if (!visible) return null;

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={[styles.header, isRTL && { flexDirection: 'row-reverse' }]}>
            <Text style={[styles.headerTitle, isRTL && { textAlign: 'right' }]}>
              {t('maintenance:actions.add_interval', { defaultValue: 'Add Custom Interval' })}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <Path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="#a1a1aa" />
              </Svg>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

            {/* Interval Title */}
            <Text style={[styles.label, isRTL && { textAlign: 'right' }]}>
              {t('maintenance:form.interval_title', { defaultValue: 'Interval Title *' })}
            </Text>
            <TextInput
              style={[styles.input, isRTL && { textAlign: 'right' }]}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Brake Fluid Inspection"
              placeholderTextColor="#71717a"
            />

            {/* Description */}
            <Text style={[styles.label, isRTL && { textAlign: 'right' }]}>
              {t('maintenance:components.notes', { defaultValue: 'Description' })}
            </Text>
            <TextInput
              style={[styles.input, styles.textArea, isRTL && { textAlign: 'right' }]}
              value={description}
              onChangeText={setDescription}
              multiline={true}
              numberOfLines={3}
              placeholderTextColor="#71717a"
            />

            {/* Interval Mileage */}
            <Text style={[styles.label, isRTL && { textAlign: 'right' }]}>
              {t('maintenance:form.interval_mileage', { defaultValue: 'Interval Mileage (KM / MI)' })}
            </Text>
            <TextInput
              style={[styles.input, isRTL && { textAlign: 'right' }]}
              value={intervalMileage}
              onChangeText={setIntervalMileage}
              keyboardType="numeric"
              placeholder="e.g. 15000"
              placeholderTextColor="#71717a"
            />

            {/* Interval Months */}
            <Text style={[styles.label, isRTL && { textAlign: 'right' }]}>
              {t('maintenance:form.interval_months', { defaultValue: 'Interval Months' })}
            </Text>
            <TextInput
              style={[styles.input, isRTL && { textAlign: 'right' }]}
              value={intervalMonths}
              onChangeText={setIntervalMonths}
              keyboardType="numeric"
              placeholder="e.g. 12"
              placeholderTextColor="#71717a"
            />

            {/* Inspection Only Toggle */}
            <View style={[styles.switchRow, isRTL && { flexDirection: 'row-reverse' }]}>
              <Text style={styles.switchLabel}>
                {t('maintenance:form.inspection_only', { defaultValue: 'Inspection Only (No Replacement)' })}
              </Text>
              <Switch
                value={isInspectionOnly}
                onValueChange={setIsInspectionOnly}
                trackColor={{ false: '#3f3f46', true: '#abc7ff' }}
                thumbColor={isInspectionOnly ? '#131313' : '#a1a1aa'}
              />
            </View>
          </ScrollView>

          {/* Footer Submit CTA */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={addIntervalMutation.isPending}
            >
              {addIntervalMutation.isPending ? (
                <ActivityIndicator color="#131313" />
              ) : (
                <Text style={styles.submitBtnText}>{t('common:save', { defaultValue: 'Save Interval' })}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#18181b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: 'Inter',
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#a1a1aa',
    marginBottom: 6,
    marginTop: 12,
    fontFamily: 'Inter',
  },
  input: {
    backgroundColor: '#27272a',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'Inter',
    borderWidth: 1,
    borderColor: '#3f3f46',
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 14,
    color: '#e4e4e7',
    fontWeight: '500',
  },
  errorText: {
    color: '#f87171',
    fontSize: 13,
    marginBottom: 10,
  },
  footer: {
    paddingTop: 8,
  },
  submitBtn: {
    backgroundColor: '#abc7ff',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#131313',
    fontFamily: 'Inter',
  },
});
