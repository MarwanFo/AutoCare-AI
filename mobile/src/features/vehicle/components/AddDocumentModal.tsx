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
import { useAddDocument } from '@/hooks/vehicle/useVehicleMutations';

interface AddDocumentModalProps {
  vehicleId: string;
  visible: boolean;
  onClose: () => void;
}

export function AddDocumentModal({ vehicleId, visible, onClose }: AddDocumentModalProps) {
  const { t } = useAppTranslation(['maintenance', 'common']);
  const { isRTL } = useRTL();
  const addDocumentMutation = useAddDocument(vehicleId);

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setErrorMsg(t('common:required', { defaultValue: 'Title is required' }));
      return;
    }
    setErrorMsg(null);
    try {
      await addDocumentMutation.mutateAsync({
        title: title.trim(),
        url: url.trim() || 'https://example.com/document.pdf',
        notes: notes.trim() || undefined,
      });
      setTitle('');
      setUrl('');
      setNotes('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || t('common:error', { defaultValue: 'Failed to add document' }));
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
              {t('maintenance:actions.add_document', { defaultValue: 'Add Custom Document' })}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <Path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="#a1a1aa" />
              </Svg>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

            {/* Document Title */}
            <Text style={[styles.label, isRTL && { textAlign: 'right' }]}>
              {t('maintenance:form.document_title', { defaultValue: 'Document Title *' })}
            </Text>
            <TextInput
              style={[styles.input, isRTL && { textAlign: 'right' }]}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Annual Insurance Policy"
              placeholderTextColor="#71717a"
            />

            {/* PDF URL / Link */}
            <Text style={[styles.label, isRTL && { textAlign: 'right' }]}>
              {t('maintenance:form.document_url', { defaultValue: 'PDF Document Link / URL' })}
            </Text>
            <TextInput
              style={[styles.input, isRTL && { textAlign: 'right' }]}
              value={url}
              onChangeText={setUrl}
              placeholder="https://..."
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
              disabled={addDocumentMutation.isPending}
            >
              {addDocumentMutation.isPending ? (
                <ActivityIndicator color="#131313" />
              ) : (
                <Text style={styles.submitBtnText}>{t('common:save', { defaultValue: 'Save Document' })}</Text>
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
    maxHeight: '80%',
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
