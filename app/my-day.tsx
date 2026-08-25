import { router } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/theme/colors';
import { brand } from '../src/theme/brand';
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
  const { width } = useWindowDimensions();
  const plan = useMemo(() => buildDayPlan(tasks), [tasks]);
  const completed = tasks.filter(t => t.status === 'completed').length;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  useEffect(() => { prepareNotifications().catch(() => undefined); }, []);
  const nickname = profile.nickname || 'you';
  const rhythm = plan.length ? plan.map(block => ({ time:new Date(block.scheduledStart).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'}), icon:block.kind==='self-care'?'🌿':block.isProtected?'🕌':'☁️', title:block.title, protected:block.isProtected })) : demoRhythm;
  const contentWidth=Math.min(width-32,760);

  return <SafeAreaView style={styles.page} edges={['top','left','right']}><ScrollView contentContainerStyle={[styles.content,{width:contentWidth,alignSelf:'center'}]}>
    <View style={styles.header}><View style={styles.brandRow}><View style={styles.avatar}><Text style={styles.avatarText}>{brand.avatar.initials}</Text></View><View><Text style={styles.greeting}>Good morning, {nickname} 🌸</Text><Text style={styles.date}>{new Date().toLocaleDateString([], {weekday:'long',month:'long',day:'numeric'})}</Text></View></View><Pressable onPress={() => router.push('/settings')} style={styles.settings}><Text>⚙️</Text></Pressable></View>
    <View style={styles.rightNow}><Text style={styles.eyebrow}>🌿 RIGHT NOW</Text><Text style={styles.nowTitle}>{plan[0]?.title || 'A gentle start'}</Text><Text style={styles.nowCopy}>{plan.length ? 'Yaya is keeping your important things visible while leaving room to breathe.' : 'Tell Yaya what you need to do. You can say it naturally — no formatting required.'}</Text><View style={styles.progressTrack}><View style={[styles.progress,{width:`${Math.max(6,progress)}%`}]} /></View></View>
    <Pressable style={styles.voiceHero} onPress={() => router.push('/yaya')}><View style={styles.voiceIcon}><Text>🎙️</Text></View><View style={{flex:1}}><Text style={styles.voiceTitle}>Just tell Yaya</Text><Text style={styles.voiceCopy}>“I need to study, call Mum, buy groceries…”</Text></View><Text style={styles.arrow}>›</Text></Pressable>
    <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Your Rhythm ✨</Text><Text style={styles.sectionHint}>A realistic day, not a packed one.</Text></View>
    <View>{rhythm.map((item,index)=><View key={item.time+item.title} style={styles.row}><Text style={styles.time}>{item.time}</Text><View style={styles.dot}/><View style={[styles.item,index===0&&styles.currentItem]}><Text style={styles.itemTitle}>{item.icon} {item.title}</Text>{item.protected&&profile.muslimMode&&<Text style={styles.protected}>Protected time</Text>}</View></View>)}</View>
    <View style={styles.progressCard}><Text style={styles.sectionTitle}>Today's progress</Text><Text style={styles.percent}>{progress}%</Text><Text style={styles.sectionHint}>{progress === 100 ? 'You actually did it. I’m proud of you. 🌸' : 'Enough progress to keep going. No pressure to be perfect.'}</Text></View>
  </ScrollView><BottomNav /></SafeAreaView>;
}

const styles=StyleSheet.create({page:{flex:1,backgroundColor:colors.cream},content:{padding:22,paddingTop:24,paddingBottom:30},header:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start'},brandRow:{flexDirection:'row',alignItems:'center',flex:1},avatar:{width:46,height:46,borderRadius:23,backgroundColor:colors.primary,alignItems:'center',justifyContent:'center',marginRight:11},avatarText:{color:colors.white,fontSize:21,fontWeight:'900'},greeting:{color:colors.plum,fontSize:22,fontWeight:'900',maxWidth:'88%'},date:{color:colors.mutedPlum,fontSize:13,marginTop:5,marginBottom:20},settings:{width:40,height:40,borderRadius:20,backgroundColor:colors.white,alignItems:'center',justifyContent:'center'},rightNow:{backgroundColor:colors.white,borderRadius:24,padding:20,borderWidth:1,borderColor:'#E9E0F1'},eyebrow:{color:colors.primary,fontSize:12,fontWeight:'900',letterSpacing:1},nowTitle:{color:colors.plum,fontSize:24,fontWeight:'900',marginTop:9},nowCopy:{color:colors.mutedPlum,fontSize:14,lineHeight:21,marginTop:5},progressTrack:{height:7,backgroundColor:'#EEE8F4',borderRadius:10,marginTop:17,overflow:'hidden'},progress:{height:'100%',backgroundColor:colors.mint,borderRadius:10},voiceHero:{backgroundColor:colors.primary,borderRadius:24,padding:16,marginTop:14,flexDirection:'row',alignItems:'center'},voiceIcon:{width:50,height:50,borderRadius:25,backgroundColor:colors.white,alignItems:'center',justifyContent:'center',marginRight:13},voiceIconText:{fontSize:24},voiceTitle:{color:colors.white,fontSize:17,fontWeight:'900'},voiceCopy:{color:colors.white,opacity:.92,fontSize:12,marginTop:4},arrow:{color:colors.white,fontSize:30,marginLeft:8},sectionHeader:{marginTop:28,marginBottom:13},sectionTitle:{color:colors.plum,fontSize:19,fontWeight:'900'},sectionHint:{color:colors.mutedPlum,fontSize:13,marginTop:5,lineHeight:19},row:{flexDirection:'row',minHeight:58,alignItems:'flex-start'},time:{width:67,color:colors.mutedPlum,fontSize:11,paddingTop:8},dot:{width:9,height:9,borderRadius:5,backgroundColor:colors.babyPink,marginTop:10,marginRight:10},item:{flex:1,paddingBottom:12,paddingHorizontal:12,paddingTop:5,borderRadius:14},currentItem:{backgroundColor:'#F2EDF9'},itemTitle:{color:colors.plum,fontSize:14,fontWeight:'800'},protected:{color:colors.primary,fontSize:11,marginTop:3},progressCard:{backgroundColor:colors.mint,borderRadius:22,padding:18,marginTop:16},percent:{color:colors.plum,fontSize:31,fontWeight:'900',marginTop:8}});
