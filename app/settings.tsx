import { router } from 'expo-router';
import { useEffect, type ReactNode } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { colors } from '../src/theme/colors';
import { CURRENT_ONBOARDING_VERSION, useAppStore } from '../src/state/app-store';
import { prepareNotifications } from '../src/notifications/local';

const personalities = [
  { key:'gentle', label:'🌸 Gentle' }, { key:'friendly', label:'💜 Friendly' }, { key:'firm', label:'💪 Firm' }, { key:'strict', label:'🔥 Strict' },
] as const;

export default function Settings() {
  const { profile, saveProfile, resetAll } = useAppStore();
  useEffect(() => { prepareNotifications().catch(() => undefined); }, []);
  const redoSetup = () => { saveProfile({ onboardingComplete: false, onboardingVersion: CURRENT_ONBOARDING_VERSION - 1 }); router.replace('/onboarding'); };
  return <SafeAreaView style={styles.page}><ScrollView contentContainerStyle={styles.content}>
    <Text style={styles.title}>Settings</Text>
    <Text style={styles.subtitle}>Make Yaya feel like yours.</Text>
    <Section title="YOU & YAYA" icon="💜">
      <Row label="Name" value={profile.name || 'Not set'} />
      <Row label="Nickname" value={profile.nickname || 'Not set'} />
      <Pressable style={styles.action} onPress={redoSetup}><Text style={styles.actionTitle}>Redo personal setup</Text><Text style={styles.actionCopy}>Update your name, nickname, Yaya's vibe and Muslim Mode.</Text></Pressable>
    </Section>
    <Section title="YAYA'S PERSONALITY" icon="🌸">
      <Text style={styles.sectionHint}>Choose the way Yaya should normally speak to you.</Text>
      <View style={styles.grid}>{personalities.map(p => <Pressable key={p.key} onPress={() => saveProfile({ personality:p.key })} style={[styles.personality, profile.personality===p.key && styles.selected]}><Text style={styles.personalityText}>{p.label}</Text></Pressable>)}</View>
    </Section>
    <Section title="PLANNING & ROUTINES" icon="🗓️">
      <ToggleRow label="Muslim Mode" copy="Prayer-aware planning and spiritual routines" value={profile.muslimMode} onChange={value => saveProfile({ muslimMode:value })} />
      <ToggleRow label="Gentle reminders" copy="Let Yaya nudge you without nagging" value={true} onChange={() => undefined} />
    </Section>
    <Section title="FAMILY" icon="🧸"><Pressable style={styles.link} onPress={() => router.push('/kids')}><Text style={styles.linkTitle}>Kids Mode</Text><Text style={styles.linkCopy}>Parent-child routines, assigned tasks and progress sharing.</Text></Pressable></Section>
    <Section title="YAYA PLUS" icon="✨"><Pressable style={styles.link} onPress={() => router.push('/premium')}><Text style={styles.linkTitle}>Explore Plus</Text><Text style={styles.linkCopy}>More planning power, deeper personalization and future premium features.</Text></Pressable></Section>
    <Section title="DATA & RESET" icon="🔒"><Text style={styles.sectionHint}>Your current MVP keeps app data locally on this device.</Text><Pressable style={styles.reset} onPress={resetAll}><Text style={styles.resetText}>Reset local Yaya data</Text></Pressable></Section>
  </ScrollView></SafeAreaView>;
}
function Section({title,icon,children}:{title:string;icon:string;children:ReactNode}){return <View style={styles.section}><View style={styles.sectionHeader}><Text style={styles.sectionIcon}>{icon}</Text><Text style={styles.sectionTitle}>{title}</Text></View>{children}</View>}
function Row({label,value}:{label:string;value:string}){return <View style={styles.row}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>}
function ToggleRow({label,copy,value,onChange}:{label:string;copy:string;value:boolean;onChange:(v:boolean)=>void}){return <View style={styles.row}><View style={{flex:1}}><Text style={styles.label}>{label}</Text><Text style={styles.copy}>{copy}</Text></View><Switch value={value} onValueChange={onChange} trackColor={{false:'#DDD5E4',true:colors.babyPink}} thumbColor={value?colors.primary:'#fff'} /></View>}
const styles=StyleSheet.create({page:{flex:1,backgroundColor:colors.cream},content:{padding:22,paddingTop:28,paddingBottom:45},title:{fontSize:31,fontWeight:'900',color:colors.plum},subtitle:{fontSize:15,color:colors.mutedPlum,marginTop:6,marginBottom:22},section:{backgroundColor:colors.white,borderRadius:20,padding:17,marginBottom:14,borderWidth:1,borderColor:'#EEE6F2'},sectionHeader:{flexDirection:'row',alignItems:'center',marginBottom:12},sectionIcon:{fontSize:17,marginRight:8},sectionTitle:{fontSize:13,fontWeight:'900',color:colors.primary,letterSpacing:1},sectionHint:{color:colors.mutedPlum,fontSize:12,lineHeight:18,marginBottom:10},row:{flexDirection:'row',alignItems:'center',paddingVertical:11,borderBottomWidth:1,borderBottomColor:'#F1ECF4'},label:{color:colors.plum,fontWeight:'800',fontSize:15},value:{color:colors.mutedPlum,fontSize:13},copy:{color:colors.mutedPlum,fontSize:12,lineHeight:18,marginTop:3},grid:{gap:8},personality:{padding:13,borderRadius:14,backgroundColor:colors.cream,borderWidth:1,borderColor:'#EEE6F2'},selected:{borderColor:colors.primary,backgroundColor:'#F5F0FC'},personalityText:{color:colors.plum,fontWeight:'800'},action:{paddingTop:13},actionTitle:{color:colors.plum,fontSize:15,fontWeight:'900'},actionCopy:{color:colors.mutedPlum,fontSize:12,lineHeight:18,marginTop:4},link:{padding:3},linkTitle:{color:colors.plum,fontSize:16,fontWeight:'900'},linkCopy:{color:colors.mutedPlum,fontSize:12,lineHeight:18,marginTop:4},reset:{alignItems:'center',padding:12},resetText:{color:'#A06A7E',fontWeight:'800'}});
