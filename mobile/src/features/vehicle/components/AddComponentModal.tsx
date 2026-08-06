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
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useAppTranslation } from '@/i18n/hooks/useAppTranslation';
import { useRTL } from '@/i18n/hooks/useRTL';
import { useAddComponent } from '@/hooks/vehicle/useVehicleMutations';

interface AddComponentModalProps {
  vehicleId: string;
  visible: boolean;
  onClose: () => void;
}

const CATEGORIES = ['ENGINE', 'TRANSMISSION', 'BRAKES', 'FLUIDS', 'FILTERS', 'TIRES', 'BATTERY', 'OTHER'];

export function AddComponentModal({ vehicleId, visible, onClose }: AddComponentModalProps) {
  const { t } = useAppTranslation(['maintenance', 'common']);
  const { isRTL } = useRTL();
  const addComponentMutation = useAddComponent(vehicleId);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('ENGINE');
  const [partNumber, setPartNumber] = useState('');
  const [specifications, setSpecifications] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setErrorMsg(t('common:required', { defaultValue: 'Name is required' }));
      return;
    }
    setErrorMsg(null);
    try {
      await addComponentMutation.mutateAsync({
        name: name.trim(),
        category,
        partNumber: partNumber.trim() || undefined,
        specifications: specifications.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setName('');
      setPartNumber('');
      setSpecifications('');
      setNotes('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || t('common:error', { defaultValue: 'Failed to add piece' }));
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
              {t('maintenance:actions.add_component', { defaultValue: 'Add Custom Piece' })}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <Path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="#a1a1aa" />
              </Svg>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

            {/* Component Name */}
            <Text style={[styles.label, isRTL && { textAlign: 'right' }]}>
              {t('maintenance:form.component_name', { defaultValue: 'Piece Name *' })}
            </Text>
            <TextInput
              style={[styles.input, isRTL && { textAlign: 'right' }]}
              value={name}
              onChangeText={setName}
              placeholder={t('maintenance:form.component_name_placeholder', { defaultValue: 'e.g. Performance Exhaust' })}
              placeholderTextColor="#71717a"
            />

            {/* Category Selector */}
            <Text style={[styles.label, isRTL && { textAlign: 'right' }]}>
              {t('maintenance:form.category', { defaultValue: 'Category' })}
            </Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catChip, category === cat && styles.catChipActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.catChipText, category === cat && styles.catChipTextActive]}>
                    {t(`maintenance:categories.${cat}`, { defaultValue: cat })}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Part Number */}
            <Text style={[styles.label, isRTL && { textAlign: 'right' }]}>
              {t('maintenance:components.part_number', { defaultValue: 'OEM Part Number' })}
            </Text>
            <TextInput
              style={[styles.input, isRTL && { textAlign: 'right' }]}
              value={partNumber}
              onChangeText={setPartNumber}
              placeholder="e.g. OEM-EX-990"
              placeholderTextColor="#71717a"
            />

            {/* Specifications */}
            <Text style={[styles.label, isRTL && { textAlign: 'right' }]}>
              {t('maintenance:components.specifications', { defaultValue: 'Specifications' })}
            </Text>
            <TextInput
              style={[styles.input, isRTL && { textAlign: 'right' }]}
              value={specifications}
              onChangeText={setSpecifications}
              placeholder="e.g. Stainless Steel"
              placeholderTextColor="#71717a"
            />

            {/* Notes */}
            <Text style={[styles.label, isRTL && { textAlign: 'right' }]}>
              {t('maintenance:components.notes', { defaultValue: 'Notes' })}
            </Text>
            <TextInput
              style={[styles.input, styles.textArea, isRTL && { textAlign: 'right' }]}
              value={notes}
              onChangeText={setNotes}
              multiline={true}
              numberOfLines={3}
              placeholderTextColor="#71717a"
            />
          </ScrollView>

          {/* Footer Submit CTA */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={addComponentMutation.isPending}
            >
              {addComponentMutation.isPending ? (
                <ActivityIndicator color="#131313" />
              ) : (
                <Text style={styles.submitBtnText}>{t('common:save', { defaultValue: 'Save Piece' })}</Text>
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
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#27272a',
    borderWidth: 1,
    borderColor: '#3f3f46',
  },
  catChipActive: {
    backgroundColor: '#abc7ff25',
    borderColor: '#abc7ff',
  },
  catChipText: {
    fontSize: 12,
    color: '#a1a1aa',
    fontWeight: '500',
  },
  catChipTextActive: {
    color: '#abc7ff',
    fontWeight: '700',
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
