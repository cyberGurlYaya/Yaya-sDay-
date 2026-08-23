import { useState } from 'react';
import { router } from 'expo-router';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { colors } from '../src/theme/colors';

const distractingApps = ['TikTok','Instagram','YouTube','X'];
export default function FocusMode() {
  const [enabled, setEnabled] = useState(false);
  const [selected, setSelected] = useState<string[]>(distractingApps);
  const toggleApp = (name:string) => setSelected(prev => prev.includes(name) ? prev.filter(x=>x!==name) : [...prev,name]);
  return <SafeAreaView style={styles.page}><ScrollView contentContainerStyle={styles.content}>
    <Pressable onPress={() => router.back()}><Text style={styles.back}>‹ Back</Text></Pressable>
    <Text style={styles.title}>Focus Mode 🔒</Text>
    <Text style={styles.subtitle}>When a task matters, Yaya can help protect your attention. The production Android build will use native usage-access/app-blocking capabilities.</Text>
    <View style={[styles.hero, enabled && styles.heroOn]}><Text style={styles.icon}>{enabled?'🛡️':'🔒'}</Text><Text style={styles.heroTitle}>{enabled?'Focus is on':'Protect this session'}</Text><Text style={styles.heroCopy}>{enabled?'Your selected distractions are on timeout.':'Choose what Yaya should help you stay away from while you focus.'}</Text><Switch value={enabled} onValueChange={setEnabled} trackColor={{false:'#DDD5E4',true:colors.babyPink}} thumbColor={enabled?colors.primary:'#fff'} /></View>
    <Text style={styles.section}>Apps to protect</Text>
    <View style={styles.card}>{distractingApps.map(name => <View key={name} style={styles.row}><Text style={styles.app}>{name}</Text><Switch value={selected.includes(name)} onValueChange={()=>toggleApp(name)} /></View>)}</View>
    <View style={styles.note}><Text style={styles.noteTitle}>What happens in production</Text><Text style={styles.noteCopy}>Yaya will request the minimum Android permissions required, show exactly what is restricted, and release restrictions when the focus session ends or the user explicitly stops it. iOS will use the platform capabilities available to us rather than pretending apps are locked.</Text></View>
  </ScrollView></SafeAreaView>;
}
const styles=StyleSheet.create({page:{flex:1,backgroundColor:colors.cream},content:{padding:22,paddingTop:30,paddingBottom:45},back:{color:colors.primary,fontWeight:'800',marginBottom:20},title:{color:colors.plum,fontSize:30,fontWeight:'900'},subtitle:{color:colors.mutedPlum,fontSize:15,lineHeight:22,marginTop:7,marginBottom:18},hero:{backgroundColor:colors.white,borderRadius:24,padding:22,alignItems:'center',borderWidth:1,borderColor:'#EEE6F2'},heroOn:{backgroundColor:'#F5F0FC',borderColor:colors.primary},icon:{fontSize:42},heroTitle:{color:colors.plum,fontWeight:'900',fontSize:19,marginTop:8},heroCopy:{color:colors.mutedPlum,textAlign:'center',fontSize:13,lineHeight:19,marginVertical:7},section:{color:colors.plum,fontWeight:'900',fontSize:17,marginTop:22,marginBottom:9},card:{backgroundColor:colors.white,borderRadius:20,padding:16},row:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:9,borderBottomWidth:1,borderBottomColor:'#F1ECF4'},app:{color:colors.plum,fontWeight:'800'},note:{backgroundColor:colors.sky,borderRadius:20,padding:17,marginTop:14},noteTitle:{color:colors.plum,fontWeight:'900'},noteCopy:{color:colors.plum,fontSize:12,lineHeight:18,marginTop:5}});
