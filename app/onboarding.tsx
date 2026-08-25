import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../src/theme/colors';
import { CURRENT_ONBOARDING_VERSION, useAppStore } from '../src/state/app-store';

type Step = 'welcome' | 'name' | 'personality' | 'muslim';

const personalities = [
  { key: 'gentle', emoji: '🌸', title: 'Gentle', copy: 'Soft, patient and encouraging.' },
  { key: 'friendly', emoji: '💜', title: 'Friendly', copy: 'Warm, playful and supportive.' },
  { key: 'firm', emoji: '💪', title: 'Firm', copy: 'Kind, focused and keeps you moving.' },
  { key: 'strict', emoji: '🔥', title: 'Strict', copy: 'Direct, disciplined and no-nonsense.' },
] as const;

export default function Onboarding() {
  const { profile, saveProfile } = useAppStore();
  const [step, setStep] = useState<Step>('welcome');
  const [name, setName] = useState(profile.name);
  const [personality, setPersonality] = useState(profile.personality);
  const [muslimMode, setMuslimMode] = useState<boolean | null>(profile.onboardingComplete ? profile.muslimMode : null);

  const next = () => {
    if (step === 'welcome') setStep('name');
    else if (step === 'name') setStep('personality');
    else if (step === 'personality') setStep('muslim');
    else {
      const finalName = name.trim() || 'Beautiful';
      saveProfile({
        name: finalName,
        nickname: finalName,
        personality,
        muslimMode: muslimMode === true,
        onboardingComplete: true,
        onboardingVersion: CURRENT_ONBOARDING_VERSION,
      });
      router.replace('/my-day');
    }
  };

  if (step === 'welcome') return <Welcome onContinue={next} />;

  return <SafeAreaView style={styles.container}>
    <View style={styles.content}>
      <Text style={styles.stepLabel}>Let's get to know each other ✨</Text>

      {step === 'name' && <>
        <Text style={styles.title}>What should I call you?</Text>
        <Text style={styles.body}>Just your name. Yaya doesn't need to manufacture a nickname for you — she can talk to you naturally.</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor={colors.mutedPlum}
          style={styles.input}
          autoFocus
        />
      </>}

      {step === 'personality' && <>
        <Text style={styles.title}>How should Yaya talk to you?</Text>
        <Text style={styles.body}>This is your default vibe. You can ask Yaya to change it whenever you need.</Text>
        <View>{personalities.map(item => <Choice
          key={item.key}
          label={`${item.emoji} ${item.title}`}
          detail={item.copy}
          selected={personality === item.key}
          onPress={() => setPersonality(item.key)}
        />)}</View>
      </>}

      {step === 'muslim' && <>
        <Text style={styles.title}>Would you like Yaya to include your Islamic practices in your day? 🌙</Text>
        <Text style={styles.body}>Optional and compassionate. Prayer and explicitly mentioned spiritual practices can be protected planning time. Yaya will never invent prayer times.</Text>
        <Choice label="🌙 Activate Muslim Mode" detail="Prayer-aware planning and reminders" selected={muslimMode === true} onPress={() => setMuslimMode(true)} />
        <Choice label="Maybe later" detail="You can turn it on in Settings" selected={muslimMode === false} onPress={() => setMuslimMode(false)} />
      </>}

      <PrimaryButton title={step === 'muslim' ? 'Meet Yaya 🌸' : 'Continue'} onPress={next} />
    </View>
  </SafeAreaView>;
}

function Welcome({ onContinue }: { onContinue: () => void }) {
  const bloom = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(bloom, { toValue: 1, duration: 1050, easing: Easing.out(Easing.back(1.2)), useNativeDriver: true }),
      Animated.timing(contentOpacity, { toValue: 1, duration: 700, delay: 350, useNativeDriver: true }),
    ]).start();
  }, [bloom, contentOpacity]);

  const flowerScale = bloom.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] });
  const flowerOpacity = bloom.interpolate({ inputRange: [0, 0.35, 1], outputRange: [0, 0.65, 1] });

  return <SafeAreaView style={styles.container}>
    <View style={styles.welcome}>
      <Animated.View style={[styles.flowerWrap, { transform: [{ scale: flowerScale }], opacity: flowerOpacity }]}>
        <View style={styles.flowerGlow} />
        <View style={[styles.petal, styles.petalTop]} /><View style={[styles.petal, styles.petalTopRight]} />
        <View style={[styles.petal, styles.petalRight]} /><View style={[styles.petal, styles.petalBottomRight]} />
        <View style={[styles.petal, styles.petalBottom]} /><View style={[styles.petal, styles.petalBottomLeft]} />
        <View style={[styles.petal, styles.petalLeft]} /><View style={[styles.petal, styles.petalTopLeft]} />
        <View style={styles.flowerCenter}><Text style={styles.flowerCenterText}>Y</Text></View>
      </Animated.View>
      <Animated.View style={[styles.welcomeCopy, { opacity: contentOpacity }]}>
        <Text style={styles.welcomeEyebrow}>WELCOME TO</Text>
        <Text style={styles.brand}>Yaya'sDay</Text>
        <Text style={styles.welcomeTitle}>Your day, but a little easier. 🌸</Text>
        <Text style={styles.welcomeBody}>Welcome. Tell Yaya what's on your mind — even when it comes out messy. She'll help turn the things in your head into a day that actually feels doable.</Text>
        <PrimaryButton title="Meet Yaya" onPress={onContinue} />
      </Animated.View>
    </View>
  </SafeAreaView>;
}

function Choice({ label, detail, selected, onPress }: { label: string; detail: string; selected: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.choice, selected && styles.choiceSelected]}>
    <Text style={styles.choiceLabel}>{label}</Text>
    <Text style={styles.choiceDetail}>{detail}</Text>
  </Pressable>;
}

function PrimaryButton({ title, onPress }: { title: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={styles.button}><Text style={styles.buttonText}>{title}</Text></Pressable>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  welcome: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 36 },
  flowerWrap: { width: 210, height: 210, borderRadius: 105, backgroundColor: '#FFF7FB', alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary, shadowOpacity: 0.2, shadowRadius: 28, elevation: 9 },
  flowerGlow: { position: 'absolute', width: 170, height: 170, borderRadius: 85, backgroundColor: colors.babyPink, opacity: 0.28 },
  petal: { position: 'absolute', width: 70, height: 92, borderRadius: 45, backgroundColor: colors.softPink },
  petalTop: { top: 16 }, petalTopRight: { top: 31, right: 32, transform: [{ rotate: '45deg' }] },
  petalRight: { right: 10, transform: [{ rotate: '90deg' }] }, petalBottomRight: { bottom: 31, right: 32, transform: [{ rotate: '135deg' }] },
  petalBottom: { bottom: 16 }, petalBottomLeft: { bottom: 31, left: 32, transform: [{ rotate: '-135deg' }] },
  petalLeft: { left: 10, transform: [{ rotate: '90deg' }] }, petalTopLeft: { top: 31, left: 32, transform: [{ rotate: '-45deg' }] },
  flowerCenter: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 5, borderColor: '#FFF7FB' },
  flowerCenterText: { color: colors.white, fontSize: 30, fontWeight: '900' },
  welcomeCopy: { width: '100%', alignItems: 'center', marginTop: 28 },
  welcomeEyebrow: { color: colors.primary, fontSize: 12, fontWeight: '900', letterSpacing: 2.2 },
  brand: { color: colors.plum, fontSize: 39, fontWeight: '900', marginTop: 5 },
  welcomeTitle: { color: colors.plum, fontSize: 22, lineHeight: 29, fontWeight: '800', textAlign: 'center', marginTop: 13 },
  welcomeBody: { color: colors.mutedPlum, fontSize: 15, lineHeight: 23, textAlign: 'center', marginTop: 10, marginBottom: 10, maxWidth: 350 },
  content: { flex: 1, padding: 28, justifyContent: 'center' },
  stepLabel: { color: colors.primary, fontSize: 14, fontWeight: '800', marginBottom: 12 },
  title: { color: colors.plum, fontSize: 29, lineHeight: 36, fontWeight: '800' },
  body: { color: colors.mutedPlum, fontSize: 16, lineHeight: 24, marginTop: 12, marginBottom: 20 },
  input: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.babyPink, borderRadius: 18, paddingHorizontal: 18, paddingVertical: 16, color: colors.plum, fontSize: 17, marginTop: 8, marginBottom: 14 },
  choice: { backgroundColor: colors.white, borderRadius: 18, borderWidth: 1, borderColor: '#E8DFF0', padding: 16, marginBottom: 10 },
  choiceSelected: { borderColor: colors.primary, backgroundColor: '#F5F0FC' },
  choiceLabel: { color: colors.plum, fontSize: 16, fontWeight: '800' },
  choiceDetail: { color: colors.mutedPlum, fontSize: 13, marginTop: 4, lineHeight: 19 },
  button: { width: '100%', backgroundColor: colors.primary, borderRadius: 18, alignItems: 'center', paddingVertical: 16, marginTop: 12 },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: '800' },
});
