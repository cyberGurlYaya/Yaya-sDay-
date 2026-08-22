import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import { colors } from '../src/theme/colors';

const rhythm = [
  { time: '4:30 AM', icon: '🌙', title: 'Tahajjud', type: 'protected' },
  { time: '5:45 AM', icon: '🕌', title: 'Fajr', type: 'protected' },
  { time: '6:00 AM', icon: '📖', title: "Qur'an", type: 'spiritual' },
  { time: '6:20 AM', icon: '🌿', title: 'Rest & Reset', type: 'rest' },
  { time: '7:00 AM', icon: '🧹', title: 'Clean my room', type: 'task' },
  { time: '8:00 AM', icon: '☕', title: 'Breakfast', type: 'rest' },
  { time: '9:00 AM', icon: '☁️', title: 'Cybersecurity Study', type: 'focus' },
];

export default function MyDay() {
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>Good morning, beautiful 💜</Text>
      <Text style={styles.date}>Saturday, August 22</Text>

      <View style={styles.rightNow}>
        <Text style={styles.eyebrow}>🌿 RIGHT NOW</Text>
        <Text style={styles.nowTitle}>Rest & Reset</Text>
        <Text style={styles.nowCopy}>You've got 17 minutes before your next thing.</Text>
        <View style={styles.progressTrack}><View style={styles.progress} /></View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Rhythm ✨</Text>
        <Text style={styles.sectionHint}>A realistic day, not a packed one.</Text>
      </View>

      <View style={styles.timeline}>
        {rhythm.map((item, index) => (
          <View key={item.time + item.title} style={styles.row}>
            <Text style={styles.time}>{item.time}</Text>
            <View style={[styles.dot, item.type === 'focus' && styles.focusDot]} />
            <View style={[styles.item, index === 6 && styles.currentItem]}>
              <Text style={styles.itemTitle}>{item.icon} {item.title}</Text>
              {item.type === 'protected' && <Text style={styles.protected}>Protected time</Text>}
              {item.type === 'focus' && <Text style={styles.focus}>Deep focus • 2 hours</Text>}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.progressCard}>
        <Text style={styles.sectionTitle}>Today's progress</Text>
        <Text style={styles.percent}>42%</Text>
        <Text style={styles.sectionHint}>Enough progress to keep going. No pressure to be perfect. 🌸</Text>
      </View>

      <Pressable style={styles.talk}>
        <Text style={styles.talkIcon}>🎙️</Text>
        <View><Text style={styles.talkTitle}>Talk to Yaya</Text><Text style={styles.talkCopy}>Tell me what's on your mind.</Text></View>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream },
  content: { padding: 22, paddingTop: 34, paddingBottom: 40 },
  greeting: { color: colors.plum, fontSize: 27, fontWeight: '800' },
  date: { color: colors.mutedPlum, fontSize: 14, marginTop: 6, marginBottom: 20 },
  rightNow: { backgroundColor: colors.white, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#E9E0F1' },
  eyebrow: { color: colors.primary, fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  nowTitle: { color: colors.plum, fontSize: 24, fontWeight: '800', marginTop: 9 },
  nowCopy: { color: colors.mutedPlum, fontSize: 14, lineHeight: 21, marginTop: 5 },
  progressTrack: { height: 7, backgroundColor: '#EEE8F4', borderRadius: 10, marginTop: 17, overflow: 'hidden' },
  progress: { width: '38%', height: '100%', backgroundColor: colors.mint, borderRadius: 10 },
  sectionHeader: { marginTop: 28, marginBottom: 13 },
  sectionTitle: { color: colors.plum, fontSize: 19, fontWeight: '800' },
  sectionHint: { color: colors.mutedPlum, fontSize: 13, marginTop: 5, lineHeight: 19 },
  timeline: { paddingBottom: 4 },
  row: { flexDirection: 'row', minHeight: 58, alignItems: 'flex-start' },
  time: { width: 67, color: colors.mutedPlum, fontSize: 11, paddingTop: 8 },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.babyPink, marginTop: 10, marginRight: 10 },
  focusDot: { backgroundColor: colors.sky },
  item: { flex: 1, paddingBottom: 12, paddingHorizontal: 12, paddingTop: 5, borderRadius: 14 },
  currentItem: { backgroundColor: '#F2EDF9' },
  itemTitle: { color: colors.plum, fontSize: 14, fontWeight: '700' },
  protected: { color: colors.primary, fontSize: 11, marginTop: 3 },
  focus: { color: '#629BC4', fontSize: 11, marginTop: 3 },
  progressCard: { backgroundColor: colors.mint, borderRadius: 22, padding: 18, marginTop: 16 },
  percent: { color: colors.plum, fontSize: 31, fontWeight: '900', marginTop: 8 },
  talk: { backgroundColor: colors.primary, borderRadius: 22, padding: 17, marginTop: 16, flexDirection: 'row', alignItems: 'center' },
  talkIcon: { fontSize: 28, marginRight: 13 },
  talkTitle: { color: colors.white, fontSize: 16, fontWeight: '800' },
  talkCopy: { color: colors.white, opacity: 0.9, fontSize: 12, marginTop: 3 },
});
