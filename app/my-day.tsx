import { router } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../src/theme/colors';
import { useAppStore } from '../src/state/app-store';
import { buildDayPlan } from '../src/scheduling/engine';
import { BottomNav } from '../src/ui/bottom-nav';
import { prepareNotifications } from '../src/notifications/local';

const demoRhythm = [
  { time: '4:30 AM', icon: '🌙', title: 'Tahajjud', protected: true },
  { time: '5:45 AM', icon: '🕌', title: 'Fajr', protected: true },
  { time: '6:20 AM', icon: '🌿', title: 'Rest & Reset' },
  { time: '8:00 AM', icon: '☕', title: 'Breakfast' },
  { time: '9:00 AM', icon: '☁️', title: 'Deep Focus' },
];

export default function MyDay() {
  const { profile, tasks } = useAppStore();
  const plan = useMemo(() => buildDayPlan(tasks), [tasks]);
  const completed = tasks.filter(t => t.status === 'completed').length;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  useEffect(() => { prepareNotifications().catch(() => undefined); }, []);
  const nickname = profile.nickname || 'beautiful';
  const rhythm = plan.length ? plan.map(block => ({ time:new Date(block.scheduledStart).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'}), icon:block.kind==='self-care'?'🌿':block.isProtected?'🕌':'☁️', title:block.title, protected:block.isProtected })) : demoRhythm;

  return <SafeAreaView style={styles.page}><ScrollView contentContainerStyle={styles.content}>
    <View style={styles.header}><View><Text style={styles.greeting}>Good morning, {nickname} 💜</Text><Text style={styles.date}>{new Date().toLocaleDateString([], {weekday:'long',month:'long',day:'numeric'})}</Text></View><Pressable onPress={() => router.push('/settings')} style={styles.settings}><Text>⚙️</Text></Pressable></View>
    <View style={styles.rightNow}><Text style={styles.eyebrow}>🌿 RIGHT NOW</Text><Text style={styles.nowTitle}>{plan[0]?.title || 'A gentle start'}</Text><Text style={styles.nowCopy}>{plan.length ? 'Yaya is keeping your important things visible while leaving room to breathe.' : 'Tell me what you need to do and I’ll help shape your day.'}</Text><View style={styles.progressTrack}><View style={[styles.progress,{width:`${Math.max(6,progress)}%`}]} /></View></View>
    <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Your Rhythm ✨</Text><Text style={styles.sectionHint}>A realistic day, not a packed one.</Text></View>
    <View>{rhythm.map((item,index)=><View key={item.time+item.title} style={styles.row}><Text style={styles.time}>{item.time}</Text><View style={styles.dot}/><View style={[styles.item,index===0&&styles.currentItem]}><Text style={styles.itemTitle}>{item.icon} {item.title}</Text>{item.protected&&profile.muslimMode&&<Text style={styles.protected}>Protected time</Text>}</View></View>)}</View>
    <View style={styles.progressCard}><Text style={styles.sectionTitle}>Today's progress</Text><Text style={styles.percent}>{progress}%</Text><Text style={styles.sectionHint}>{progress === 100 ? 'You actually did it. I’m proud of you. 🌸' : 'Enough progress to keep going. No pressure to be perfect.'}</Text></View>
    <Pressable style={styles.talk} onPress={() => router.push('/yaya')}><Text style={styles.talkIcon}>🎙️</Text><View><Text style={styles.talkTitle}>Talk to Yaya</Text><Text style={styles.talkCopy}>Tell me what’s on your mind.</Text></View></Pressable>
  </ScrollView><BottomNav /></SafeAreaView>;
}

const styles=StyleSheet.create({page:{flex:1,backgroundColor:colors.cream},content:{padding:22,paddingTop:28,paddingBottom:30},header:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start'},greeting:{color:colors.plum,fontSize:25,fontWeight:'900',maxWidth:'88%'},date:{color:colors.mutedPlum,fontSize:14,marginTop:6,marginBottom:20},settings:{width:40,height:40,borderRadius:20,backgroundColor:colors.white,alignItems:'center',justifyContent:'center'},rightNow:{backgroundColor:colors.white,borderRadius:24,padding:20,borderWidth:1,borderColor:'#E9E0F1'},eyebrow:{color:colors.primary,fontSize:12,fontWeight:'900',letterSpacing:1},nowTitle:{color:colors.plum,fontSize:24,fontWeight:'900',marginTop:9},nowCopy:{color:colors.mutedPlum,fontSize:14,lineHeight:21,marginTop:5},progressTrack:{height:7,backgroundColor:'#EEE8F4',borderRadius:10,marginTop:17,overflow:'hidden'},progress:{height:'100%',backgroundColor:colors.mint,borderRadius:10},sectionHeader:{marginTop:28,marginBottom:13},sectionTitle:{color:colors.plum,fontSize:19,fontWeight:'900'},sectionHint:{color:colors.mutedPlum,fontSize:13,marginTop:5,lineHeight:19},row:{flexDirection:'row',minHeight:58,alignItems:'flex-start'},time:{width:67,color:colors.mutedPlum,fontSize:11,paddingTop:8},dot:{width:9,height:9,borderRadius:5,backgroundColor:colors.babyPink,marginTop:10,marginRight:10},item:{flex:1,paddingBottom:12,paddingHorizontal:12,paddingTop:5,borderRadius:14},currentItem:{backgroundColor:'#F2EDF9'},itemTitle:{color:colors.plum,fontSize:14,fontWeight:'800'},protected:{color:colors.primary,fontSize:11,marginTop:3},progressCard:{backgroundColor:colors.mint,borderRadius:22,padding:18,marginTop:16},percent:{color:colors.plum,fontSize:31,fontWeight:'900',marginTop:8},talk:{backgroundColor:colors.primary,borderRadius:22,padding:17,marginTop:16,flexDirection:'row',alignItems:'center'},talkIcon:{fontSize:28,marginRight:13},talkTitle:{color:colors.white,fontSize:16,fontWeight:'900'},talkCopy:{color:colors.white,opacity:.9,fontSize:12,marginTop:3}});
