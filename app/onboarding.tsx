import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../src/theme/colors';

type Step = 'welcome' | 'name' | 'nickname' | 'personality' | 'muslim';

const personalities = [
  { key: 'gentle', emoji: '🌸', title: 'Gentle', copy: 'Soft, patient and encouraging.' },
  { key: 'friendly', emoji: '💜', title: 'Friendly', copy: 'Warm, playful and supportive.' },
  { key: 'firm', emoji: '💪', title: 'Firm', copy: 'Kind, focused and keeps you moving.' },
  { key: 'strict', emoji: '🔥', title: 'Strict', copy: 'Direct, disciplined and no-nonsense.' },
] as const;

function nicknameIdeas(name: string) {
  const clean = name.trim() || 'beautiful';
  const first = clean.split(/\s+/)[0];
  return [`${first} ✨`, `${first} Bloom`, `Yaya's ${first}`];
}

export default function Onboarding() {
  const [step, setStep] = useState<Step>('welcome');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [personality, setPersonality] = useState('friendly');
  const [muslimMode, setMuslimMode] = useState<boolean | null>(null);
  const ideas = useMemo(() => nicknameIdeas(name), [name]);

  const next = () => {
    if (step === 'welcome') setStep('name');
    else if (step === 'name') setStep('nickname');
    else if (step === 'nickname') setStep('personality');
    else if (step === 'personality') setStep('muslim');
    else router.replace('/my-day');
  };

  if (step === 'welcome') {
    return <SafeAreaView style={styles.container}><View style={styles.welcome}>
      <Text style={styles.welcomeText}>Welcome, beautiful</Text>
      <View style={styles.flowerPlaceholder}><Text style={styles.flower}>✿</Text></View>
      <Text style={styles.brand}>Yaya'sDay</Text>
      <Text style={styles.caption}>Your day, your rhythm, your little companion.</Text>
      <PrimaryButton title="Let's meet" onPress={next} />
    </View></SafeAreaView>;
  }

  return <SafeAreaView style={styles.container}><View style={styles.content}>
    <Text style={styles.stepLabel}>Let's get to know each other ✨</Text>
    {step === 'name' && <><Text style={styles.title}>What would you like me to call you?</Text><Text style={styles.body}>Your name helps me make your day feel personal from the very beginning.</Text><TextInput value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={colors.mutedPlum} style={styles.input} autoFocus /></>}
    {step === 'nickname' && <><Text style={styles.title}>Pick your sparkle ✨</Text><Text style={styles.body}>I made a few ideas from your name. You can choose one, ask for more, keep your name, or create your own.</Text><View style={styles.cards}>{ideas.map((idea) => <Choice key={idea} label={idea} detail="Suggested for you" selected={nickname === idea} onPress={() => setNickname(idea)} />)}<Choice label="Create your own ✍️" detail="Custom" selected={nickname !== '' && !ideas.includes(nickname)} onPress={() => setNickname('')} /></View><TextInput value={nickname} onChangeText={setNickname} placeholder="Or type your own nickname" placeholderTextColor={colors.mutedPlum} style={styles.input} /></>}
    {step === 'personality' && <><Text style={styles.title}>How should I talk to you?</Text><Text style={styles.body}>You choose my default personality. You can change the vibe later.</Text><View style={styles.cards}>{personalities.map((item) => <Choice key={item.key} label={`${item.emoji} ${item.title}`} detail={item.copy} selected={personality === item.key} onPress={() => setPersonality(item.key)} />)}</View></>}
    {step === 'muslim' && <><Text style={styles.title}>Would you like me to include your Islamic practices in your day? 🌙</Text><Text style={styles.body}>Muslim Mode is completely optional. When enabled, Yaya can treat prayer and selected spiritual practices as meaningful parts of your schedule.</Text><Choice label="🌙 Activate Muslim Mode" detail="Prayer-aware planning and reminders" selected={muslimMode === true} onPress={() => setMuslimMode(true)} /><Choice label="Maybe later" detail="You can turn it on in settings" selected={muslimMode === false} onPress={() => setMuslimMode(false)} /></>}
    <PrimaryButton title={step === 'muslim' ? 'Meet Yaya 🌸' : 'Continue'} onPress={next} />
  </View></SafeAreaView>;
}

function Choice({ label, detail, selected, onPress }: { label: string; detail: string; selected: boolean; onPress: () => void }) { return <Pressable onPress={onPress} style={[styles.choice, selected && styles.choiceSelected]}><Text style={styles.choiceLabel}>{label}</Text><Text style={styles.choiceDetail}>{detail}</Text></Pressable>; }
function PrimaryButton({ title, onPress }: { title: string; onPress: () => void }) { return <Pressable onPress={onPress} style={styles.button}><Text style={styles.buttonText}>{title}</Text></Pressable>; }

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream }, welcome: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 }, content: { flex: 1, padding: 28, justifyContent: 'center' }, welcomeText: { color: colors.plum, fontSize: 28, fontWeight: '700', marginBottom: 34 }, flowerPlaceholder: { width: 210, height: 210, borderRadius: 105, backgroundColor: colors.babyPink, alignItems: 'center', justifyContent: 'center', opacity: 0.9 }, flower: { fontSize: 104, color: colors.primary }, brand: { color: colors.plum, fontSize: 36, fontWeight: '800', marginTop: 28 }, caption: { color: colors.mutedPlum, fontSize: 15, textAlign: 'center', marginTop: 10, marginBottom: 30 }, stepLabel: { color: colors.primary, fontSize: 14, fontWeight: '700', marginBottom: 12 }, title: { color: colors.plum, fontSize: 29, lineHeight: 36, fontWeight: '800' }, body: { color: colors.mutedPlum, fontSize: 16, lineHeight: 24, marginTop: 12, marginBottom: 22 }, input: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.babyPink, borderRadius: 18, paddingHorizontal: 18, paddingVertical: 16, color: colors.plum, fontSize: 17, marginBottom: 18 }, cards: { gap: 10, marginBottom: 16 }, choice: { backgroundColor: colors.white, borderRadius: 18, borderWidth: 1, borderColor: '#E8DFF0', padding: 16, marginBottom: 10 }, choiceSelected: { borderColor: colors.primary, backgroundColor: '#F5F0FC' }, choiceLabel: { color: colors.plum, fontSize: 16, fontWeight: '700' }, choiceDetail: { color: colors.mutedPlum, fontSize: 13, marginTop: 4, lineHeight: 19 }, button: { backgroundColor: colors.primary, borderRadius: 18, alignItems: 'center', paddingVertical: 16, marginTop: 14 }, buttonText: { color: colors.white, fontSize: 16, fontWeight: '800' },
});
