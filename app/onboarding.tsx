import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../src/theme/colors';
import { CURRENT_ONBOARDING_VERSION, useAppStore } from '../src/state/app-store';

type Step = 'welcome' | 'name' | 'nickname' | 'personality' | 'muslim';
const personalities = [
  { key: 'gentle', emoji: '🌸', title: 'Gentle', copy: 'Soft, patient and encouraging.' },
  { key: 'friendly', emoji: '💜', title: 'Friendly', copy: 'Warm, playful and supportive.' },
  { key: 'firm', emoji: '💪', title: 'Firm', copy: 'Kind, focused and keeps you moving.' },
  { key: 'strict', emoji: '🔥', title: 'Strict', copy: 'Direct, disciplined and no-nonsense.' },
] as const;

function nicknameIdeas(name: string) {
  const first = (name.trim() || 'Yaya').split(/\s+/)[0];
  const lower = first.toLowerCase();
  const ideas = new Set<string>([first]);
  if (first.length >= 4) ideas.add(first.slice(0, 3));
  if (first.length >= 5) ideas.add(first.slice(1));
  if (lower === 'alia') ['Ali', 'Lia', 'Lili', 'Yaya'].forEach(x => ideas.add(x));
  if (lower === 'aaliyah') ['Aali', 'Lia', 'Yaya', 'Lily'].forEach(x => ideas.add(x));
  if (lower === 'olamide') ['Ola', 'Lami', 'Mide'].forEach(x => ideas.add(x));
  if (lower === 'adegoke') ['Ade', 'Goke', 'Koke'].forEach(x => ideas.add(x));
  return Array.from(ideas).slice(0, 4);
}

export default function Onboarding() {
  const { profile, saveProfile } = useAppStore();
  const [step, setStep] = useState<Step>('welcome');
  const [name, setName] = useState(profile.name);
  const [nickname, setNickname] = useState(profile.nickname);
  const [personality, setPersonality] = useState(profile.personality);
  const [muslimMode, setMuslimMode] = useState<boolean | null>(profile.onboardingComplete ? profile.muslimMode : null);
  const ideas = useMemo(() => nicknameIdeas(name), [name]);

  const next = () => {
    if (step === 'welcome') setStep('name');
    else if (step === 'name') setStep('nickname');
    else if (step === 'nickname') setStep('personality');
    else if (step === 'personality') setStep('muslim');
    else {
      saveProfile({ name: name.trim() || 'Beautiful', nickname: nickname.trim() || name.trim() || 'Beautiful', personality, muslimMode: muslimMode === true, onboardingComplete: true, onboardingVersion: CURRENT_ONBOARDING_VERSION });
      router.replace('/my-day');
    }
  };

  if (step === 'welcome') return <Welcome onContinue={next} />;

  return <SafeAreaView style={styles.container}><View style={styles.content}>
    <Text style={styles.stepLabel}>Let's get to know each other ✨</Text>
    {step === 'name' && <>
      <Text style={styles.title}>What would you like me to call you?</Text>
      <Text style={styles.body}>Your name helps me make your day feel personal from the very beginning.</Text>
      <TextInput value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={colors.mutedPlum} style={styles.input} autoFocus />
    </>}
    {step === 'nickname' && <>
      <Text style={styles.title}>Pick a nickname 💜</Text>
      <Text style={styles.body}>I’ll suggest playful versions of your real name — short, familiar and easy to say. No random aesthetic names.</Text>
      <View>{ideas.map(idea => <Choice key={idea} label={idea} detail="A name-based nickname" selected={nickname === idea} onPress={() => setNickname(idea)} />)}</View>
      <Choice label="Keep my name" detail={name || 'Your name'} selected={nickname === name} onPress={() => setNickname(name)} />
      <TextInput value={nickname} onChangeText={setNickname} placeholder="Or create your own nickname ✍️" placeholderTextColor={colors.mutedPlum} style={styles.input} />
    </>}
    {step === 'personality' && <>
      <Text style={styles.title}>How should I talk to you?</Text>
      <Text style={styles.body}>This is your default vibe. You can ask me to change it whenever you need.</Text>
      <View>{personalities.map(item => <Choice key={item.key} label={`${item.emoji} ${item.title}`} detail={item.copy} selected={personality === item.key} onPress={() => setPersonality(item.key)} />)}</View>
    </>}
    {step === 'muslim' && <>
      <Text style={styles.title}>Would you like me to include your Islamic practices in your day? 🌙</Text>
      <Text style={styles.body}>Optional and always compassionate. Prayer can become protected scheduling time, alongside any spiritual practices you choose.</Text>
      <Choice label="🌙 Activate Muslim Mode" detail="Prayer-aware planning and reminders" selected={muslimMode === true} onPress={() => setMuslimMode(true)} />
      <Choice label="Maybe later" detail="You can turn it on in Settings" selected={muslimMode === false} onPress={() => setMuslimMode(false)} />
    </>}
    <PrimaryButton title={step === 'muslim' ? 'Meet Yaya 🌸' : 'Continue'} onPress={next} />
  </View></SafeAreaView>;
}

function Welcome({ onContinue }: { onContinue: () => void }) {
  const flowerScale = useRef(new Animated.Value(0.25)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(flowerScale, { toValue: 1, duration: 850, easing: Easing.out(Easing.back(1.15)), useNativeDriver: true }),
      Animated.timing(contentOpacity, { toValue: 1, duration: 650, delay: 250, useNativeDriver: true }),
    ]).start();
  }, [contentOpacity, flowerScale]);
  return <SafeAreaView style={styles.container}><View style={styles.welcome}>
    <Animated.View style={[styles.flowerWrap, { transform: [{ scale: flowerScale }] }]}>
      <View style={styles.flowerGlow} />
      <Text style={styles.flower}>✿</Text>
    </Animated.View>
    <Animated.View style={[styles.welcomeCopy, { opacity: contentOpacity }]}>
      <Text style={styles.welcomeEyebrow}>WELCOME TO</Text>
      <Text style={styles.brand}>Yaya'sDay</Text>
      <Text style={styles.welcomeTitle}>Your day, but a little easier. 🌸</Text>
      <Text style={styles.welcomeBody}>Tell Yaya what’s on your mind. She’ll help you turn the messy list in your head into a day that actually feels doable.</Text>
      <PrimaryButton title="Meet Yaya" onPress={onContinue} />
    </Animated.View>
  </View></SafeAreaView>;
}

function Choice({ label, detail, selected, onPress }: { label: string; detail: string; selected: boolean; onPress: () => void }) { return <Pressable onPress={onPress} style={[styles.choice, selected && styles.choiceSelected]}><Text style={styles.choiceLabel}>{label}</Text><Text style={styles.choiceDetail}>{detail}</Text></Pressable>; }
function PrimaryButton({ title, onPress }: { title: string; onPress: () => void }) { return <Pressable onPress={onPress} style={styles.button}><Text style={styles.buttonText}>{title}</Text></Pressable>; }

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream }, welcome: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 36 }, flowerWrap: { width: 205, height: 205, borderRadius: 103, backgroundColor: colors.babyPink, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary, shadowOpacity: 0.16, shadowRadius: 28, elevation: 8 }, flowerGlow: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: '#FFF9F2', opacity: 0.45 }, flower: { fontSize: 105, color: colors.primary }, welcomeCopy: { width: '100%', alignItems: 'center', marginTop: 28 }, welcomeEyebrow: { color: colors.primary, fontSize: 12, fontWeight: '900', letterSpacing: 2.2 }, brand: { color: colors.plum, fontSize: 39, fontWeight: '900', marginTop: 5 }, welcomeTitle: { color: colors.plum, fontSize: 22, lineHeight: 29, fontWeight: '800', textAlign: 'center', marginTop: 13 }, welcomeBody: { color: colors.mutedPlum, fontSize: 15, lineHeight: 23, textAlign: 'center', marginTop: 10, marginBottom: 10, maxWidth: 350 }, content: { flex: 1, padding: 28, justifyContent: 'center' }, stepLabel: { color: colors.primary, fontSize: 14, fontWeight: '800', marginBottom: 12 }, title: { color: colors.plum, fontSize: 29, lineHeight: 36, fontWeight: '800' }, body: { color: colors.mutedPlum, fontSize: 16, lineHeight: 24, marginTop: 12, marginBottom: 20 }, input: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.babyPink, borderRadius: 18, paddingHorizontal: 18, paddingVertical: 16, color: colors.plum, fontSize: 17, marginTop: 8, marginBottom: 14 }, choice: { backgroundColor: colors.white, borderRadius: 18, borderWidth: 1, borderColor: '#E8DFF0', padding: 16, marginBottom: 10 }, choiceSelected: { borderColor: colors.primary, backgroundColor: '#F5F0FC' }, choiceLabel: { color: colors.plum, fontSize: 16, fontWeight: '800' }, choiceDetail: { color: colors.mutedPlum, fontSize: 13, marginTop: 4, lineHeight: 19 }, button: { width: '100%', backgroundColor: colors.primary, borderRadius: 18, alignItems: 'center', paddingVertical: 16, marginTop: 12 }, buttonText: { color: colors.white, fontSize: 16, fontWeight: '800' },
});
