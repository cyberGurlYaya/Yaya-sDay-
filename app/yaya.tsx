import { router } from 'expo-router';
import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../src/theme/colors';
import { brand } from '../src/theme/brand';
import { makeTask, useAppStore } from '../src/state/app-store';
import { interpretWithYaya } from '../src/ai/client';
import { scheduleTaskReminder } from '../src/notifications/local';
import { BottomNav } from '../src/ui/bottom-nav';

type Message={id:string;from:'yaya'|'user';text:string};

type DeviceVoice = { identifier: string; language: string; name: string; quality?: string };

function pickPreferredVoice(voices: DeviceVoice[]) {
  const english = voices.filter(v => /^en(-|$)/i.test(v.language));
  const female = english.filter(v => /female|woman|samantha|ava|jenny|aria|karen|moira|susan|google us english/i.test(`${v.name} ${v.identifier}`));
  return female.find(v => /enhanced|high|premium|natural/i.test(`${v.name} ${v.quality ?? ''}`)) || female[0] || english.find(v => /^en-US$/i.test(v.language)) || english[0];
}

export default function Yaya(){
  const { profile, addTask, saveProfile } = useAppStore();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [text,setText]=useState('');
  const [busy,setBusy]=useState(false);
  const [listening,setListening]=useState(false);
  const transcriptRef=useRef('');
  const submittedRef=useRef(false);
  const [voiceId,setVoiceId]=useState<string | undefined>(profile.voiceId);
  const [messages,setMessages]=useState<Message[]>([{id:'welcome',from:'yaya',text:`Hey ${profile.nickname||'you'} 🌸 I’m Yaya. Say everything that’s on your mind — even if it’s messy. I’ll turn it into a realistic day.`}]);

  useEffect(()=>{
    Speech.getAvailableVoicesAsync().then(voices=>{
      const selected=profile.voiceId ? voices.find(v=>v.identifier===profile.voiceId) : undefined;
      const preferred=selected || pickPreferredVoice(voices);
      if(preferred){
        setVoiceId(preferred.identifier);
        if(!profile.voiceId) saveProfile({voiceId:preferred.identifier});
      }
    }).catch(()=>undefined);
  },[profile.voiceId,saveProfile]);

  const speak=(value:string)=>Speech.speak(value,{language:'en-US',rate:0.93,pitch:1.02,volume:1,voice:voiceId});

  const submit=async(value:string)=>{
    const clean=value.trim();
    if(!clean||busy)return;
    setBusy(true); setText('');
    setMessages(prev=>[...prev,{id:`${Date.now()}u`,from:'user',text:clean}]);
    try{
      const proposal=await interpretWithYaya(clean);
      for(const taskProposal of proposal.tasks){
        const task=makeTask(taskProposal.title,taskProposal);
        addTask(task);
        if(task.startsAt)await scheduleTaskReminder(task.title,new Date(task.startsAt),10);
      }
      setMessages(prev=>[...prev,{id:`${Date.now()}y`,from:'yaya',text:proposal.message}]);
      speak(proposal.message);
    }catch{
      const fallback='I couldn’t organize that right now. Your words are still here — try again in a moment. 💜';
      setMessages(prev=>[...prev,{id:`${Date.now()}e`,from:'yaya',text:fallback}]);
      speak(fallback);
    }finally{setBusy(false);}
  };

  useSpeechRecognitionEvent('start',()=>{setListening(true);submittedRef.current=false;});
  useSpeechRecognitionEvent('result',(event)=>{
    const transcript=event.results?.[0]?.transcript || '';
    if(!transcript)return;
    transcriptRef.current=transcript;
    setText(transcript);
    if(event.isFinal && !submittedRef.current){
      submittedRef.current=true;
      ExpoSpeechRecognitionModule.stop();
      void submit(transcript);
    }
  });
  useSpeechRecognitionEvent('end',()=>setListening(false));
  useSpeechRecognitionEvent('error',(event)=>{
    setListening(false);
    if(event.error!=='aborted'){
      setMessages(prev=>[...prev,{id:`${Date.now()}e`,from:'yaya',text:'I couldn’t hear you clearly. Tap the microphone and try again. 🎙️'}]);
    }
  });

  const toggleListening=async()=>{
    if(listening){ExpoSpeechRecognitionModule.stop();return;}
    const permission=await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if(!permission.granted){
      setMessages(prev=>[...prev,{id:`${Date.now()}e`,from:'yaya',text:'I need microphone and speech-recognition permission before I can listen to you. 💜'}]);
      return;
    }
    transcriptRef.current='';
    setText('');
    ExpoSpeechRecognitionModule.start({lang:'en-US',interimResults:true,maxAlternatives:1,continuous:false,addsPunctuation:true,contextualStrings:['Yaya','Yaya’sDay','to-do','task','schedule']});
  };

  const contentWidth=Math.min(width-32,720);
  return <View style={[styles.page,{paddingTop:insets.top}]}>
    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}>
      <View style={[styles.shell,{width:contentWidth,alignSelf:'center'}]}>
        <View style={styles.header}>
          <Pressable onPress={()=>router.back()} style={styles.backButton}><Text style={styles.back}>‹</Text></Pressable>
          <View style={styles.brandRow}><View style={styles.avatar}><Text style={styles.avatarText}>{brand.avatar.initials}</Text></View><View><Text style={styles.headerTitle}>Yaya</Text><Text style={styles.headerSub}>{listening?'I’m listening…':'Your gentle day companion'}</Text></View></View>
          <View style={{width:42}} />
        </View>
        <ScrollView contentContainerStyle={styles.messages} keyboardShouldPersistTaps="handled">
          <View style={styles.brandIntro}><Text style={styles.brandMark}>Y</Text><Text style={styles.brandName}>{brand.name}</Text><Text style={styles.brandTagline}>{brand.tagline}</Text></View>
          {messages.map(m=><View key={m.id} style={[styles.bubble,m.from==='user'?styles.userBubble:styles.yayaBubble]}><View style={styles.bubbleHeader}><Text style={[styles.bubbleText,m.from==='user'&&styles.userText]}>{m.text}</Text>{m.from==='yaya'&&<Pressable onPress={()=>speak(m.text)}><Text style={styles.listen}>🔊</Text></Pressable>}</View></View>)}
          {listening&&<View style={styles.listeningCard}><View style={styles.pulse}><Text style={styles.mic}>🎙️</Text></View><View><Text style={styles.listeningTitle}>Yaya is listening</Text><Text style={styles.listeningCopy}>Say your tasks naturally. You don’t have to format them.</Text></View></View>}
        </ScrollView>
        <View style={styles.composer}>
          <TextInput value={text} onChangeText={setText} placeholder="Say it or type it…" placeholderTextColor={colors.mutedPlum} style={styles.input} multiline/>
          <Pressable onPress={toggleListening} disabled={busy} style={[styles.micButton,listening&&styles.micButtonActive]}><Text style={styles.micButtonText}>{listening?'■':'🎙️'}</Text></Pressable>
          <Pressable onPress={()=>submit(text)} disabled={busy||!text.trim()} style={[styles.send,!text.trim()&&styles.sendDisabled]}>{busy?<ActivityIndicator color={colors.white}/>:<Text style={styles.sendText}>↑</Text>}</Pressable>
        </View>
        <Text style={styles.helper}>{listening?'Tap ■ when you’re done, or let Yaya catch the final sentence.':'Tap the microphone first — typing is only the backup.'}</Text>
      </View>
      <BottomNav/>
    </KeyboardAvoidingView>
  </View>;
}

const styles=StyleSheet.create({page:{flex:1,backgroundColor:colors.cream},shell:{flex:1,backgroundColor:colors.cream},header:{minHeight:66,paddingHorizontal:12,flexDirection:'row',alignItems:'center',justifyContent:'space-between',borderBottomWidth:1,borderBottomColor:'#EEE6F2',backgroundColor:colors.white},backButton:{width:42,height:42,alignItems:'center',justifyContent:'center'},back:{fontSize:34,color:colors.plum},brandRow:{flexDirection:'row',alignItems:'center',flex:1,justifyContent:'center'},avatar:{width:40,height:40,borderRadius:20,backgroundColor:colors.primary,alignItems:'center',justifyContent:'center',marginRight:9},avatarText:{color:colors.white,fontWeight:'900',fontSize:19},headerTitle:{fontSize:18,fontWeight:'900',color:colors.plum},headerSub:{fontSize:11,color:colors.mutedPlum,marginTop:2},messages:{padding:16,paddingBottom:24},brandIntro:{alignItems:'center',paddingVertical:12},brandMark:{width:58,height:58,borderRadius:29,backgroundColor:colors.softPink,textAlign:'center',textAlignVertical:'center',color:colors.plum,fontSize:28,fontWeight:'900',paddingTop:10},brandName:{fontSize:20,fontWeight:'900',color:colors.plum,marginTop:8},brandTagline:{fontSize:12,color:colors.mutedPlum,marginTop:2},bubble:{maxWidth:'88%',borderRadius:20,padding:14,marginBottom:10},yayaBubble:{backgroundColor:colors.white,alignSelf:'flex-start',borderTopLeftRadius:7},userBubble:{backgroundColor:colors.primary,alignSelf:'flex-end',borderTopRightRadius:7},bubbleHeader:{flexDirection:'row',alignItems:'flex-end'},bubbleText:{color:colors.plum,fontSize:15,lineHeight:22,flex:1},userText:{color:colors.white},listen:{fontSize:15,marginLeft:8},listeningCard:{backgroundColor:'#F2EDF9',borderRadius:20,padding:14,flexDirection:'row',alignItems:'center',marginTop:4},pulse:{width:46,height:46,borderRadius:23,backgroundColor:colors.babyPink,alignItems:'center',justifyContent:'center',marginRight:12},mic:{fontSize:22},listeningTitle:{color:colors.plum,fontSize:14,fontWeight:'900'},listeningCopy:{color:colors.mutedPlum,fontSize:12,marginTop:3,maxWidth:250,lineHeight:17},composer:{backgroundColor:colors.white,borderTopWidth:1,borderTopColor:'#EEE6F2',padding:10,flexDirection:'row',alignItems:'flex-end'},input:{flex:1,maxHeight:100,minHeight:46,borderRadius:18,backgroundColor:colors.cream,paddingHorizontal:15,paddingVertical:12,color:colors.plum,fontSize:15},micButton:{marginLeft:7,width:46,height:46,borderRadius:23,backgroundColor:colors.mint,alignItems:'center',justifyContent:'center'},micButtonActive:{backgroundColor:colors.babyPink},micButtonText:{fontSize:18,color:colors.plum,fontWeight:'900'},send:{marginLeft:7,width:46,height:46,borderRadius:23,backgroundColor:colors.primary,alignItems:'center',justifyContent:'center'},sendDisabled:{opacity:.45},sendText:{color:colors.white,fontSize:25,fontWeight:'900'},helper:{fontSize:10,color:colors.mutedPlum,textAlign:'center',paddingVertical:7,backgroundColor:colors.white}});
