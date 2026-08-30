import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { vehicleAdvisorApi, AiAdvisorResponse } from '@/api/vehicleAdvisorApi';
import { useLanguage } from '@/i18n/hooks/useLanguage';

interface AiAdvisorTabProps {
  vehicleId: string;
  vehicleName: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

const PRESET_QUESTIONS = [
  'What engine oil viscosity is required?',
  'When should I replace brake pads?',
  'How do I reset service interval indicator?',
  'What battery specification is recommended?',
];

export function AiAdvisorTab({ vehicleId, vehicleName }: AiAdvisorTabProps) {
  const { isRTL } = useLanguage();

  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello! I am your AutoCare AI Specialist for your ${vehicleName}. Ask me anything about maintenance schedules, OEM fluid capacities, part specs, or troubleshooting!`,
    },
  ]);

  const handleAsk = async (questionToAsk?: string) => {
    const q = (questionToAsk || inputQuestion).trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setLoading(true);

    try {
      const res: AiAdvisorResponse = await vehicleAdvisorApi.askAdvisor(vehicleId, q);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: res.answer,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Sorry, I had trouble retrieving specs right now. Please verify your internet connection and try again.',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Banner */}
      <View style={styles.banner}>
        <View style={styles.sparkleIcon}>
          <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 2L14.39 8.26L21 9.27L16 13.87L17.47 20.27L12 17L6.53 20.27L8 13.87L3 9.27L9.61 8.26L12 2Z"
              fill="#3B82F6"
            />
          </Svg>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>AutoCare Diagnostics Terminal</Text>
          <Text style={styles.bannerSub}>
            OEM technical database & workshop telemetry for {vehicleName}
          </Text>
        </View>
      </View>

      {/* Suggested Quick Questions */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.presetsScroll}
        contentContainerStyle={styles.presetsContent}
      >
        {PRESET_QUESTIONS.map((q, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.presetChip}
            onPress={() => handleAsk(q)}
            disabled={loading}
          >
            <Text style={styles.presetChipText}>{q}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Chat History */}
      <ScrollView
        style={styles.chatScroll}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((m) => (
          <View
            key={m.id}
            style={[
              styles.msgBubble,
              m.sender === 'user'
                ? isRTL
                  ? styles.userBubbleRTL
                  : styles.userBubble
                : isRTL
                ? styles.aiBubbleRTL
                : styles.aiBubble,
            ]}
          >
            <Text
              style={[
                styles.msgText,
                m.sender === 'user' ? styles.userMsgText : styles.aiMsgText,
                isRTL && styles.textRight,
              ]}
            >
              {m.text}
            </Text>
          </View>
        ))}

        {loading && (
          <View style={styles.typingRow}>
            <ActivityIndicator size="small" color="#3B82F6" />
            <Text style={styles.typingText}>Consulting workshop manual...</Text>
          </View>
        )}
      </ScrollView>

      {/* Input Row */}
      <View style={[styles.inputRow, isRTL && styles.rowReverse]}>
        <TextInput
          style={[styles.chatInput, isRTL && styles.textRight]}
          placeholder="Ask a technical or maintenance question..."
          placeholderTextColor="#64748B"
          value={inputQuestion}
          onChangeText={setInputQuestion}
          editable={!loading}
          onSubmitEditing={() => handleAsk()}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[
            styles.sendBtn,
            (!inputQuestion.trim() || loading) && styles.sendBtnDisabled,
          ]}
          onPress={() => handleAsk()}
          disabled={!inputQuestion.trim() || loading}
        >
          <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <Path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="#FFFFFF" />
          </Svg>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#131722',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#181D2A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  sparkleIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  bannerSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  presetsScroll: {
    maxHeight: 36,
    marginBottom: 10,
  },
  presetsContent: {
    gap: 6,
  },
  presetChip: {
    backgroundColor: '#181D2A',
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  presetChipText: {
    fontSize: 11,
    color: '#3B82F6',
    fontWeight: '600',
  },
  chatScroll: {
    flex: 1,
    maxHeight: 280,
  },
  chatContent: {
    gap: 8,
    paddingBottom: 10,
  },
  msgBubble: {
    maxWidth: '85%',
    borderRadius: 12,
    padding: 10,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#2563EB',
    borderBottomRightRadius: 2,
  },
  userBubbleRTL: {
    alignSelf: 'flex-start',
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#181D2A',
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderBottomLeftRadius: 2,
  },
  aiBubbleRTL: {
    alignSelf: 'flex-end',
  },
  msgText: {
    fontSize: 12,
    lineHeight: 17,
  },
  userMsgText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  aiMsgText: {
    color: '#E2E8F0',
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typingText: {
    fontSize: 11,
    color: '#64748B',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  textRight: {
    textAlign: 'right',
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#181D2A',
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#F8FAFC',
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.35,
  },
});
