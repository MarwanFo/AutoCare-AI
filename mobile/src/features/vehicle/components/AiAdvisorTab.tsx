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
          <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 2L14.39 8.26L21 9.27L16 13.87L17.47 20.27L12 17L6.53 20.27L8 13.87L3 9.27L9.61 8.26L12 2Z"
              fill="#abc7ff"
            />
          </Svg>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>AutoCare AI Advisor</Text>
          <Text style={styles.bannerSub}>
            Trained on factory repair manuals for {vehicleName}
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
        {PRESET_QUESTIONS.map((pq, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.presetChip}
            onPress={() => handleAsk(pq)}
            disabled={loading}
          >
            <Text style={styles.presetChipText}>{pq}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Chat Messages */}
      <ScrollView style={styles.chatScroll} contentContainerStyle={styles.chatContent}>
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.msgBubble,
              msg.sender === 'user' ? styles.userBubble : styles.aiBubble,
              isRTL && (msg.sender === 'user' ? styles.userBubbleRTL : styles.aiBubbleRTL),
            ]}
          >
            <Text
              style={[
                styles.msgText,
                msg.sender === 'user' ? styles.userMsgText : styles.aiMsgText,
              ]}
            >
              {msg.text}
            </Text>
          </View>
        ))}

        {loading && (
          <View style={[styles.msgBubble, styles.aiBubble, styles.typingRow]}>
            <ActivityIndicator size="small" color="#abc7ff" />
            <Text style={styles.typingText}>Consulting factory digital twin specs...</Text>
          </View>
        )}
      </ScrollView>

      {/* Input Row */}
      <View style={[styles.inputRow, isRTL && styles.rowReverse]}>
        <TextInput
          style={[styles.chatInput, isRTL && styles.textRight]}
          value={inputQuestion}
          onChangeText={setInputQuestion}
          placeholder="Ask AI about your car specs..."
          placeholderTextColor="#8e9192"
          onSubmitEditing={() => handleAsk()}
          editable={!loading}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !inputQuestion.trim() && styles.sendBtnDisabled]}
          onPress={() => handleAsk()}
          disabled={!inputQuestion.trim() || loading}
        >
          <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <Path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="#131313" />
          </Svg>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#abc7ff15',
    borderColor: '#abc7ff30',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    gap: 10,
    marginBottom: 12,
  },
  sparkleIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#abc7ff25',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '700',
    color: '#abc7ff',
  },
  bannerSub: {
    fontFamily: 'Inter',
    fontSize: 11,
    color: '#c4c7c8',
  },
  presetsScroll: {
    maxHeight: 38,
    marginBottom: 12,
  },
  presetsContent: {
    gap: 8,
  },
  presetChip: {
    backgroundColor: '#1c1c1c',
    borderColor: '#2f3131',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  presetChipText: {
    fontFamily: 'Inter',
    fontSize: 11,
    color: '#abc7ff',
    fontWeight: '500',
  },
  chatScroll: {
    flex: 1,
    maxHeight: 280,
  },
  chatContent: {
    gap: 10,
    paddingBottom: 12,
  },
  msgBubble: {
    maxWidth: '85%',
    borderRadius: 16,
    padding: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#abc7ff',
    borderBottomRightRadius: 4,
  },
  userBubbleRTL: {
    alignSelf: 'flex-start',
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#1c1c1c',
    borderColor: '#2f3131',
    borderWidth: 1,
    borderBottomLeftRadius: 4,
  },
  aiBubbleRTL: {
    alignSelf: 'flex-end',
  },
  msgText: {
    fontFamily: 'Inter',
    fontSize: 13,
    lineHeight: 18,
  },
  userMsgText: {
    color: '#131313',
    fontWeight: '600',
  },
  aiMsgText: {
    color: '#e4e4e7',
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typingText: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#8e9192',
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
    backgroundColor: '#1c1c1c',
    borderColor: '#2f3131',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: 'Inter',
    fontSize: 13,
    color: '#ffffff',
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#abc7ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});
