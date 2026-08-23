import { router } from 'expo-router';
import * as Speech from 'expo-speech';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../src/theme/colors';
import { makeTask, useAppStore } from '../src/state/app-store';
import { interpretWithYaya } from '../src/ai/client';
import { BottomNav } from '../src/ui/bottom-nav';

type Message = { id: string; from: 'yaya' | 'user'; text: string };

export default function Yaya() {
  const { profile, addTask } = useAppStore();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ id:'welcome', from:'yaya', text:`Hey ${profile.nickname || 'beautiful'} 💜 Tell me what's on your mind. You can brain-dump your whole day — I'll help make sense of it.` }]);

  const send = async () => {
    const value = text.trim(); if (!value || busy) return;
    setBusy(true); setText('');
    setMessages(prev => [...prev, { id: `${Date.now()}u`, from:'user', text:value }]);
    const proposal = await interpretWithYaya(value);
    proposal.tasks.forEach(task => addTask(makeTask(task.title, task)));
    setMessages(prev => [...prev, { id:`${Date.now()}y`, from:'yaya', text:proposal.message }]);
    Speech.speak(proposal.message, { rate: 0.96, pitch: 1.04 });
    setBusy(false);
  };

  return <SafeAreaView style={styles.page}><KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}>
    <View style={styles.header}><Pressable onPress={() => router.back()}><Text style={styles.back}>‹</Text></Pressable><View><Text style={styles.headerTitle}>Yaya 💜</Text><Text style={styles.headerSub}>Your day companion</Text></View></View>
    <ScrollView contentContainerStyle={styles.messages}>{messages.map(m => <View key={m.id} style={[styles.bubble,m.from==='user'?styles.userBubble:styles.yayaBubble]}><View style={styles.bubbleHeader}><Text style={[styles.bubbleText,m.from==='user'&&styles.userText]}>{m.text}</Text>{m.from==='yaya'&&<Pressable onPress={() => Speech.speak(m.text, { rate:0.96, pitch:1.04 })}><Text style={styles.listen}>🔊</Text></Pressable>}</View></View>)}</ScrollView>
    <View style={styles.composer}><TextInput value={text} onChangeText={setText} placeholder="Tell Yaya what's on your mind..." placeholderTextColor={colors.mutedPlum} style={styles.input} multiline /><Pressable onPress={send} style={styles.send}>{busy?<ActivityIndicator color={colors.white}/>:<Text style={styles.sendText}>↑</Text>}</Pressable></View>
    <BottomNav />
  </KeyboardAvoidingView></SafeAreaView>;
}

const styles=StyleSheet.create({page:{flex:1,backgroundColor:colors.cream},header:{padding:14,flexDirection:'row',alignItems:'center',borderBottomWidth:1,borderBottomColor:'#EEE6F2',backgroundColor:colors.white},back:{fontSize:34,color:colors.plum,marginRight:12},headerTitle:{fontSize:18,fontWeight:'900',color:colors.plum},headerSub:{fontSize:11,color:colors.mutedPlum,marginTop:2},messages:{padding:18,paddingBottom:24},bubble:{maxWidth:'88%',borderRadius:20,padding:14,marginBottom:10},yayaBubble:{backgroundColor:colors.white,alignSelf:'flex-start',borderTopLeftRadius:7},userBubble:{backgroundColor:colors.primary,alignSelf:'flex-end',borderTopRightRadius:7},bubbleHeader:{flexDirection:'row',alignItems:'flex-end'},bubbleText:{color:colors.plum,fontSize:15,lineHeight:22,flex:1},userText:{color:colors.white},listen:{fontSize:15,marginLeft:8},composer:{backgroundColor:colors.white,borderTopWidth:1,borderTopColor:'#EEE6F2',padding:10,flexDirection:'row',alignItems:'flex-end'},input:{flex:1,maxHeight:100,minHeight:46,borderRadius:18,backgroundColor:colors.cream,paddingHorizontal:15,paddingVertical:12,color:colors.plum,fontSize:15},send:{marginLeft:8,width:46,height:46,borderRadius:23,backgroundColor:colors.primary,alignItems:'center',justifyContent:'center'},sendText:{color:colors.white,fontSize:25,fontWeight:'900'} });
