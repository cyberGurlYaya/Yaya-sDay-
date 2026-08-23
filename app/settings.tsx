import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { colors } from '../src/theme/colors';
import { useAppStore } from '../src/state/app-store';
import { prepareNotifications } from '../src/notifications/local';

const personalities = [
  { key:'gentle', label:'🌸 Gentle' }, { key:'friendly', label:'💜 Friendly' }, { key:'firm', label:'💪 Firm' }, { key:'strict', label:'🔥 Strict' },
] as const;
export default function Settings() {
  const { profile, saveProfile, resetAll } = useAppStore();
  useEffect(() => { prepareNotifications().catch(() => undefined); }, []);
  return <SafeAreaView style={styles.page}><ScrollView contentContainerStyle={styles.content}>
    <Text style={styles.title}>You & Yaya 💜</Text>
    <Text style={styles.subtitle}>Make Yaya feel like yours.</Text>
    <Section title="Your identity"><Row label="Name" value={profile.name || 'Not set'} /><Row label="Nickname" value={profile.nickname || 'Not set'} /></Section>
    <Section title="How Yaya talks to you"><View style={styles.grid}>{personalities.map(p => <Pressable key={p.key} onPress={() => saveProfile({ personality:p.key })} style={[styles.personality, profile.personality===p.key && styles.selected]}><Text style={styles.personalityText}>{p.label}</Text></Pressable>)}</View></Section>
    <Section title="Your rhythm"><ToggleRow label="Muslim Mode" copy="Prayer-aware planning and spiritual routines" value={profile.muslimMode} onChange={value => saveProfile({ muslimMode:value })} /><ToggleRow label="Gentle reminders" copy="Let Yaya nudge you without nagging" value={true} onChange={() => undefined} /></Section>
    <Section title="Family & future"><Pressable style={styles.link} onPress={() => router.push('/kids')}><Text style={styles.linkTitle}>🧸 Kids Mode</Text><Text style={styles.linkCopy}>Parent-child routines, assigned tasks and progress sharing.</Text></Pressable></Section>
    <Pressable style={styles.reset} onPress={resetAll}><Text style={styles.resetText}>Reset local Yaya data</Text></Pressable>
  </ScrollView></SafeAreaView>;
}
function Section({title,children}:{title:string;children:React.ReactNode}){return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{children}</View>}
function Row({label,value}:{label:string;value:string}){return <View style={styles.row}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>}
function ToggleRow({label,copy,value,onChange}:{label:string;copy:string;value:boolean;onChange:(v:boolean)=>void}){return <View style={styles.row}><View style={{flex:1}}><Text style={styles.label}>{label}</Text><Text style={styles.copy}>{copy}</Text></View><Switch value={value} onValueChange={onChange} trackColor={{false:'#DDD5E4',true:colors.babyPink}} thumbColor={value?colors.primary:'#fff'} /></View>}
const styles=StyleSheet.create({page:{flex:1,backgroundColor:colors.cream},content:{padding:22,paddingTop:28,paddingBottom:45},title:{fontSize:30,fontWeight:'900',color:colors.plum},subtitle:{fontSize:15,color:colors.mutedPlum,marginTop:6,marginBottom:20},section:{backgroundColor:colors.white,borderRadius:20,padding:16,marginBottom:14,borderWidth:1,borderColor:'#EEE6F2'},sectionTitle:{fontSize:14,fontWeight:'900',color:colors.primary,marginBottom:10},row:{flexDirection:'row',alignItems:'center',paddingVertical:10,borderBottomWidth:1,borderBottomColor:'#F1ECF4'},label:{color:colors.plum,fontWeight:'800',fontSize:15},value:{color:colors.mutedPlum,fontSize:13},copy:{color:colors.mutedPlum,fontSize:12,lineHeight:18,marginTop:3},grid:{gap:8},personality:{padding:13,borderRadius:14,backgroundColor:colors.cream,borderWidth:1,borderColor:'#EEE6F2'},selected:{borderColor:colors.primary,backgroundColor:'#F5F0FC'},personalityText:{color:colors.plum,fontWeight:'800'},link:{padding:5},linkTitle:{color:colors.plum,fontSize:16,fontWeight:'900'},linkCopy:{color:colors.mutedPlum,fontSize:12,lineHeight:18,marginTop:4},reset:{alignItems:'center',padding:14},resetText:{color:'#A06A7E',fontWeight:'800'}});
