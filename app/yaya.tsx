import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../src/theme/colors';
import { brand } from '../src/theme/brand';
import { makeTask, useAppStore } from '../src/state/app-store';
import { interpretWithYaya } from '../src/ai/client';
import { scheduleTaskReminder } from '../src/notifications/local';
import { BottomNav } from '../src/ui/bottom-nav';

type Message = { id: string; from: 'yaya' | 'user'; text: string; edited?: boolean };
type DeviceVoice = { identifier: string; language: string; name: string; quality?: string };

const MESSAGE_STORAGE_KEY = '@yayasday/chat/v1';

function pickPreferredVoice(voices: DeviceVoice[]) {
  const english = voices.filter(v => /^en(-|$)/i.test(v.language));
  const score = (voice: DeviceVoice) => {
    const text = `${voice.name} ${voice.identifier} ${voice.quality ?? ''}`.toLowerCase();
    let value = 0;
    if (/en-us/.test(voice.language.toLowerCase())) value += 30;
    if (/google us english/.test(text)) value += 28;
    if (/samantha|ava|jenny|aria|karen|moira/.test(text)) value += 24;
    if (/female|woman/.test(text)) value += 18;
    if (/natural|enhanced|premium|high/.test(text)) value += 16;
    if (/novelty|robot|compact/.test(text)) value -= 12;
    return value;
  };
  return [...english].sort((a, b) => score(b) - score(a))[0];
}

function makeWelcome(nickname?: string): Message {
  return {
    id: 'welcome',
    from: 'yaya',
    text: `Hey ${nickname || 'you'} 🌸 I’m Yaya. Tell me everything that’s on your mind — messy is completely fine. I’ll help you turn it into a realistic day, not just another boring to-do list.`,
  };
}

export default function Yaya() {
  const { profile, tasks, addTask, removeTasksBySourceMessageId, saveProfile } = useAppStore();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [hydratedMessages, setHydratedMessages] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [voiceId, setVoiceId] = useState<string | undefined>(profile.voiceId);
  const [messages, setMessages] = useState<Message[]>([]);
  const transcriptRef = useRef('');
  const submittedRef = useRef(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    AsyncStorage.getItem(MESSAGE_STORAGE_KEY).then(raw => {
      try {
        const saved = raw ? JSON.parse(raw) as Message[] : [];
        setMessages(Array.isArray(saved) && saved.length ? saved : [makeWelcome(profile.nickname)]);
      } catch {
        setMessages([makeWelcome(profile.nickname)]);
      }
      setHydratedMessages(true);
    }).catch(() => {
      setMessages([makeWelcome(profile.nickname)]);
      setHydratedMessages(true);
    });
  }, [profile.nickname]);

  useEffect(() => {
    if (hydratedMessages) {
      AsyncStorage.setItem(MESSAGE_STORAGE_KEY, JSON.stringify(messages.slice(-80))).catch(() => undefined);
    }
  }, [messages, hydratedMessages]);

  useEffect(() => {
    Speech.getAvailableVoicesAsync().then(voices => {
      const selected = profile.voiceId ? voices.find(v => v.identifier === profile.voiceId) : undefined;
      const preferred = selected || pickPreferredVoice(voices as DeviceVoice[]);
      if (preferred) {
        setVoiceId(preferred.identifier);
        if (!profile.voiceId) saveProfile({ voiceId: preferred.identifier });
      }
    }).catch(() => undefined);
  }, [profile.voiceId, saveProfile]);

  const speak = (value: string) => {
    Speech.stop();
    Speech.speak(value, { language: 'en-US', rate: 0.91, pitch: 1.03, volume: 1, voice: voiceId });
  };

  const scrollToLatest = (animated = true) => {
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated }));
  };

  useEffect(() => {
    if (messages.length) scrollToLatest(false);
  }, [messages.length]);

  const submit = async (value: string, existingMessageId?: string) => {
    const clean = value.trim();
    if (!clean || busy) return;

    const messageId = existingMessageId || `${Date.now()}u`;
    setBusy(true);
    setText('');
    setEditingId(null);

    if (existingMessageId) {
      setMessages(prev => prev.map(message => message.id === existingMessageId ? { ...message, text: clean, edited: true } : message));
      removeTasksBySourceMessageId(existingMessageId);
    } else {
      setMessages(prev => [...prev, { id: messageId, from: 'user', text: clean }]);
    }
    scrollToLatest();

    try {
      const proposal = await interpretWithYaya(clean, {
        nickname: profile.nickname,
        personality: profile.personality,
        muslimMode: profile.muslimMode,
        currentTasks: tasks.map(task => ({ title: task.title, status: task.status, kind: task.kind, priority: task.priority })),
      });

      for (const taskProposal of proposal.tasks) {
        const task = makeTask(taskProposal.title, { ...taskProposal, sourceMessageId: messageId });
        addTask(task);
        if (task.startsAt) await scheduleTaskReminder(task.title, new Date(task.startsAt), 10);
      }

      const responseText = existingMessageId
        ? `Updated. I re-read what you meant and adjusted the tasks from that message. ${proposal.message}`
        : proposal.message;
      setMessages(prev => [...prev, { id: `${Date.now()}y`, from: 'yaya', text: responseText }]);
      scrollToLatest();
      speak(responseText);
    } catch {
      const fallback = 'I couldn’t organize that right now. Your message is still here — please try again in a moment. 💜';
      setMessages(prev => [...prev, { id: `${Date.now()}e`, from: 'yaya', text: fallback }]);
      scrollToLatest();
      speak(fallback);
    } finally {
      setBusy(false);
    }
  };

  const beginEdit = (message: Message) => {
    if (busy) return;
    setEditingId(message.id);
    setText(message.text);
    scrollToLatest();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setText('');
  };

  useSpeechRecognitionEvent('start', () => { setListening(true); submittedRef.current = false; });
  useSpeechRecognitionEvent('result', event => {
    const transcript = event.results?.[0]?.transcript || '';
    if (!transcript) return;
    transcriptRef.current = transcript;
    setText(transcript);
    scrollToLatest();
    if (event.isFinal && !submittedRef.current) {
      submittedRef.current = true;
      ExpoSpeechRecognitionModule.stop();
      void submit(transcript, editingId || undefined);
    }
  });
  useSpeechRecognitionEvent('end', () => setListening(false));
  useSpeechRecognitionEvent('error', event => {
    setListening(false);
    if (event.error !== 'aborted') {
      setMessages(prev => [...prev, { id: `${Date.now()}e`, from: 'yaya', text: 'I couldn’t hear you clearly. Tap the microphone and try again. 🎙️' }]);
    }
  });

  const toggleListening = async () => {
    if (listening) { ExpoSpeechRecognitionModule.stop(); return; }
    const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!permission.granted) {
      setMessages(prev => [...prev, { id: `${Date.now()}e`, from: 'yaya', text: 'I need microphone and speech-recognition permission before I can listen to you. 💜' }]);
      return;
    }
    transcriptRef.current = '';
    setText('');
    ExpoSpeechRecognitionModule.start({ lang: 'en-US', interimResults: true, maxAlternatives: 1, continuous: false, addsPunctuation: true, contextualStrings: ['Yaya', 'Yaya’sDay', 'to-do', 'task', 'schedule'] });
  };

  const contentWidth = Math.min(width - 32, 720);
  const editing = editingId !== null;

  return <View style={[styles.page, { paddingTop: insets.top }]}>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 4 : 0}
    >
      <View style={[styles.shell, { width: contentWidth, alignSelf: 'center' }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}><Text style={styles.back}>‹</Text></Pressable>
          <View style={styles.brandRow}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{brand.avatar.initials}</Text></View>
            <View><Text style={styles.headerTitle}>Yaya</Text><Text style={styles.headerSub}>{listening ? 'I’m listening…' : editing ? 'Editing your message…' : 'Your gentle day companion'}</Text></View>
          </View>
          <View style={{ width: 42 }} />
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.messages}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          onContentSizeChange={() => scrollToLatest(false)}
        >
          <View style={styles.brandIntro}>
            <View style={styles.flowerMark}><Text style={styles.flower}>🌸</Text></View>
            <Text style={styles.brandName}>{brand.name}</Text>
            <Text style={styles.brandTagline}>{brand.tagline}</Text>
          </View>

          {messages.map(message => <View key={message.id} style={[styles.bubble, message.from === 'user' ? styles.userBubble : styles.yayaBubble]}>
            <View style={styles.bubbleHeader}>
              <Text style={[styles.bubbleText, message.from === 'user' && styles.userText]}>{message.text}</Text>
              {message.from === 'yaya' && <Pressable onPress={() => speak(message.text)} hitSlop={8}><Text style={styles.listen}>🔊</Text></Pressable>}
            </View>
            {message.from === 'user' && message.id !== 'welcome' && <View style={styles.userActions}>
              {message.edited && <Text style={styles.editedLabel}>edited</Text>}
              <Pressable onPress={() => beginEdit(message)} disabled={busy}><Text style={styles.editButton}>Edit</Text></Pressable>
            </View>}
          </View>)}

          {listening && <View style={styles.listeningCard}>
            <View style={styles.pulse}><Text style={styles.mic}>🎙️</Text></View>
            <View><Text style={styles.listeningTitle}>Yaya is listening</Text><Text style={styles.listeningCopy}>Say your tasks naturally. You don’t have to format them.</Text></View>
          </View>}
        </ScrollView>

        {editing && <View style={styles.editBanner}><Text style={styles.editBannerText}>Editing this message — Yaya will re-process it when you save.</Text><Pressable onPress={cancelEdit}><Text style={styles.cancelEdit}>Cancel</Text></Pressable></View>}
        <View style={styles.composer}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={editing ? 'Change what you meant…' : 'Say it or type it…'}
            placeholderTextColor={colors.mutedPlum}
            style={styles.input}
            multiline
            blurOnSubmit={false}
            onFocus={() => scrollToLatest()}
          />
          {!editing && <Pressable onPress={toggleListening} disabled={busy} style={[styles.micButton, listening && styles.micButtonActive]}><Text style={styles.micButtonText}>{listening ? '■' : '🎙️'}</Text></Pressable>}
          <Pressable onPress={() => void submit(text, editingId || undefined)} disabled={busy || !text.trim()} style={[styles.send, !text.trim() && styles.sendDisabled]}>
            {busy ? <ActivityIndicator color={colors.white} /> : <Text style={styles.sendText}>{editing ? '✓' : '↑'}</Text>}
          </Pressable>
        </View>
        <Text style={styles.helper}>{editing ? 'Save to let Yaya rethink the tasks from this message.' : listening ? 'Tap ■ when you’re done, or let Yaya catch the final sentence.' : 'Tap the microphone first — typing is only the backup.'}</Text>
      </View>
      <BottomNav />
    </KeyboardAvoidingView>
  </View>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream },
  shell: { flex: 1, backgroundColor: colors.cream },
  header: { minHeight: 66, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#EEE6F2', backgroundColor: colors.white },
  backButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  back: { fontSize: 34, color: colors.plum },
  brandRow: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 9 },
  avatarText: { color: colors.white, fontWeight: '900', fontSize: 19 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: colors.plum },
  headerSub: { fontSize: 11, color: colors.mutedPlum, marginTop: 2 },
  scroll: { flex: 1 },
  messages: { padding: 16, paddingBottom: 28 },
  brandIntro: { alignItems: 'center', paddingVertical: 12 },
  flowerMark: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.softPink, alignItems: 'center', justifyContent: 'center' },
  flower: { fontSize: 31 },
  brandName: { fontSize: 20, fontWeight: '900', color: colors.plum, marginTop: 8 },
  brandTagline: { fontSize: 12, color: colors.mutedPlum, marginTop: 2 },
  bubble: { maxWidth: '88%', borderRadius: 20, padding: 14, marginBottom: 10 },
  yayaBubble: { backgroundColor: colors.white, alignSelf: 'flex-start', borderTopLeftRadius: 7 },
  userBubble: { backgroundColor: colors.primary, alignSelf: 'flex-end', borderTopRightRadius: 7 },
  bubbleHeader: { flexDirection: 'row', alignItems: 'flex-end' },
  bubbleText: { color: colors.plum, fontSize: 15, lineHeight: 22, flex: 1 },
  userText: { color: colors.white },
  listen: { fontSize: 15, marginLeft: 8 },
  userActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 7, gap: 9 },
  editedLabel: { color: 'rgba(255,255,255,0.72)', fontSize: 10 },
  editButton: { color: colors.white, fontSize: 11, fontWeight: '900', textDecorationLine: 'underline' },
  listeningCard: { backgroundColor: '#F2EDF9', borderRadius: 20, padding: 14, flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  pulse: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.babyPink, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  mic: { fontSize: 22 },
  listeningTitle: { color: colors.plum, fontSize: 14, fontWeight: '900' },
  listeningCopy: { color: colors.mutedPlum, fontSize: 12, marginTop: 3, maxWidth: 250, lineHeight: 17 },
  editBanner: { backgroundColor: '#F5F0FC', borderTopWidth: 1, borderTopColor: '#E8DCF3', paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  editBannerText: { flex: 1, color: colors.mutedPlum, fontSize: 11, lineHeight: 16 },
  cancelEdit: { color: colors.plum, fontWeight: '900', fontSize: 12, marginLeft: 10 },
  composer: { backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: '#EEE6F2', padding: 10, flexDirection: 'row', alignItems: 'flex-end' },
  input: { flex: 1, maxHeight: 120, minHeight: 46, borderRadius: 18, backgroundColor: colors.cream, paddingHorizontal: 15, paddingVertical: 12, color: colors.plum, fontSize: 15, textAlignVertical: 'top' },
  micButton: { marginLeft: 7, width: 46, height: 46, borderRadius: 23, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' },
  micButtonActive: { backgroundColor: colors.babyPink },
  micButtonText: { fontSize: 18, color: colors.plum, fontWeight: '900' },
  send: { marginLeft: 7, width: 46, height: 46, borderRadius: 23, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendDisabled: { opacity: .45 },
  sendText: { color: colors.white, fontSize: 25, fontWeight: '900' },
  helper: { fontSize: 10, color: colors.mutedPlum, textAlign: 'center', paddingVertical: 7, backgroundColor: colors.white },
});
