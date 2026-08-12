import React, { useEffect, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useAppTranslation } from '@/i18n/hooks/useAppTranslation';
import { useRTL } from '@/i18n/hooks/useRTL';
import { useUpdateComponent } from '@/hooks/vehicle/useVehicleMutations';
import { DatePickerInput } from './DatePickerInput';
import { UserComponent } from '@/types/vehicle';

import { resolveComponentName } from '../utils/componentResolver';

interface RecordReplacementModalProps {
  vehicleId: string;
  component: UserComponent | null;
  currentVehicleMileage?: number | null;
  mileageUnit?: string;
  visible: boolean;
  onClose: () => void;
}

export function RecordReplacementModal({
  vehicleId,
  component,
  currentVehicleMileage,
  mileageUnit = 'KM',
  visible,
  onClose,
}: RecordReplacementModalProps) {
  const { t } = useAppTranslation(['maintenance', 'common']);
  const { isRTL } = useRTL();
  const updateComponentMutation = useUpdateComponent(vehicleId);

  const todayIso = new Date().toISOString().split('T')[0];
  const [replacementDate, setReplacementDate] = useState<string>(todayIso);
  const [replacementMileage, setReplacementMileage] = useState<string>('');
  const [partNumber, setPartNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (component) {
      setReplacementDate(component.lastReplacedDate || component.installationDate || todayIso);
      setReplacementMileage(
        component.lastReplacedMileage !== undefined && component.lastReplacedMileage !== null
          ? String(component.lastReplacedMileage)
          : component.installationMileage !== undefined && component.installationMileage !== null
          ? String(component.installationMileage)
          : currentVehicleMileage ? String(currentVehicleMileage) : '0'
      );
      setPartNumber(component.partNumber || '');
      setNotes(component.notes || '');
      setErrorMsg(null);
    }
  }, [component, visible, currentVehicleMileage]);

  const handleSubmit = async () => {
    if (!component) return;

    const mileageNum = replacementMileage.trim() !== '' ? parseInt(replacementMileage.trim(), 10) : undefined;
    if (mileageNum !== undefined && (isNaN(mileageNum) || mileageNum < 0)) {
      setErrorMsg(t('common:invalid_mileage', { defaultValue: 'Please enter a valid non-negative mileage' }));
      return;
    }

    setErrorMsg(null);
    try {
      await updateComponentMutation.mutateAsync({
        componentId: component.id,
        payload: {
          category: component.category,
          name: component.name,
          partNumber: partNumber.trim() || component.partNumber,
          specifications: component.specifications,
          notes: notes.trim() || component.notes,
          installationDate: replacementDate,
          lastReplacedDate: replacementDate,
          installationMileage: mileageNum,
          lastReplacedMileage: mileageNum,
        },
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || t('common:error', { defaultValue: 'Failed to update replacement date' }));
    }
  };

  if (!visible || !component) return null;

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={[styles.header, isRTL && { flexDirection: 'row-reverse' }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.headerTitle, isRTL && { textAlign: 'right' }]}>
                {t('maintenance:actions.set_replacement_date', { defaultValue: 'Set Replacement Date' })}
              </Text>
              <Text style={[styles.headerSub, isRTL && { textAlign: 'right' }]}>
                {resolveComponentName(component.name, component.canonicalCode, component.isCustom, t)}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <Path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="#a1a1aa" />
              </Svg>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

            {/* Date Input */}
            <DatePickerInput
              label={t('maintenance:form.replacement_date', { defaultValue: 'Date of Replacement / Installation' })}
              value={replacementDate}
              onChange={setReplacementDate}
              required={true}
              maxDate={new Date()}
            />

            {/* Mileage Input */}
            <Text style={[styles.label, isRTL && { textAlign: 'right' }]}>
              {t('maintenance:form.replacement_mileage', { defaultValue: `Vehicle Mileage at Replacement (${mileageUnit})` })}
            </Text>
            <TextInput
              style={[styles.input, isRTL && { textAlign: 'right' }]}
              value={replacementMileage}
              onChangeText={setReplacementMileage}
              keyboardType="number-pad"
              placeholder={currentVehicleMileage ? `e.g. ${currentVehicleMileage}` : 'e.g. 50000'}
              placeholderTextColor="#71717a"
            />

            {/* Part Number */}
            <Text style={[styles.label, isRTL && { textAlign: 'right' }]}>
              {t('maintenance:components.part_number', { defaultValue: 'Part / Brand Number (Optional)' })}
            </Text>
            <TextInput
              style={[styles.input, isRTL && { textAlign: 'right' }]}
              value={partNumber}
              onChangeText={setPartNumber}
              placeholder="e.g. Bosch-9920"
              placeholderTextColor="#71717a"
            />

            {/* Notes */}
            <Text style={[styles.label, isRTL && { textAlign: 'right' }]}>
              {t('maintenance:components.notes', { defaultValue: 'Notes (Optional)' })}
            </Text>
            <TextInput
              style={[styles.input, styles.textArea, isRTL && { textAlign: 'right' }]}
              value={notes}
              onChangeText={setNotes}
              multiline={true}
              numberOfLines={2}
              placeholder="e.g. Changed at official service station"
              placeholderTextColor="#71717a"
            />
          </ScrollView>

          {/* Submit Action */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={updateComponentMutation.isPending}
            >
              {updateComponentMutation.isPending ? (
                <ActivityIndicator color="#131313" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {t('maintenance:actions.calculate_health', { defaultValue: 'Save & Calculate Health' })}
                </Text>
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
  headerSub: {
    fontSize: 13,
    color: '#abc7ff',
    fontWeight: '600',
    fontFamily: 'Inter',
    marginTop: 2,
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
