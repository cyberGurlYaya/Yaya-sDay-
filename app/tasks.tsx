import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { BottomNav } from '../src/ui/bottom-nav';
import { colors } from '../src/theme/colors';
import { makeTask, useAppStore } from '../src/state/app-store';
import { parseNaturalTaskText } from '../src/scheduling/engine';

export default function Tasks() {
  const { tasks, addTask, updateTask, removeTask } = useAppStore();
  const [input, setInput] = useState('');
  const [showComposer, setShowComposer] = useState(false);

  const addFromText = () => {
    if (!input.trim()) return;
    parseNaturalTaskText(input).forEach(part => addTask(makeTask(part.title || input, part)));
    setInput(''); setShowComposer(false);
  };
  const openYaya = () => router.push('/yaya');
  const active = tasks.filter(t => !['completed','cancelled'].includes(t.status));

  return <SafeAreaView style={styles.page}>
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Your tasks ✨</Text>
      <Text style={styles.subtitle}>Tell me what needs doing. You don't have to organize it first.</Text>
      <Pressable style={styles.aiButton} onPress={openYaya}><Text style={styles.aiIcon}>💜</Text><View><Text style={styles.aiTitle}>Tell Yaya naturally</Text><Text style={styles.aiCopy}>“I need to study for two hours and cook lunch.”</Text></View></Pressable>
      {showComposer && <View style={styles.composer}><TextInput autoFocus multiline value={input} onChangeText={setInput} placeholder="What's on your mind?" placeholderTextColor={colors.mutedPlum} style={styles.textInput} /><Pressable style={styles.addButton} onPress={addFromText}><Text style={styles.addText}>Add to my day</Text></Pressable></View>}
      {!showComposer && <Pressable style={styles.quickAdd} onPress={() => setShowComposer(true)}><Text style={styles.quickAddText}>＋ Add a task</Text></Pressable>}
      {active.length === 0 ? <View style={styles.empty}><Text style={styles.emptyEmoji}>🌸</Text><Text style={styles.emptyTitle}>Nothing waiting yet.</Text><Text style={styles.emptyCopy}>Give Yaya a brain dump and we'll figure out the rest together.</Text></View> : active.map(task => <View key={task.id} style={styles.task}>
        <Pressable style={styles.check} onPress={() => updateTask(task.id, { status: 'completed' })}><Text style={styles.checkText}>✓</Text></Pressable>
        <View style={{ flex: 1 }}><Text style={styles.taskTitle}>{task.title}</Text><Text style={styles.meta}>{task.kind} · {task.durationMinutes ?? 30} min · {task.priority}</Text></View>
        <Pressable onPress={() => removeTask(task.id)}><Text style={styles.delete}>×</Text></Pressable>
      </View>)}
    </ScrollView>
    <BottomNav />
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  page:{flex:1,backgroundColor:colors.cream},content:{padding:22,paddingTop:28,paddingBottom:30},title:{fontSize:30,fontWeight:'900',color:colors.plum},subtitle:{fontSize:15,lineHeight:22,color:colors.mutedPlum,marginTop:7,marginBottom:18},aiButton:{backgroundColor:colors.primary,borderRadius:22,padding:17,flexDirection:'row',alignItems:'center'},aiIcon:{fontSize:28,marginRight:13},aiTitle:{color:colors.white,fontWeight:'900',fontSize:16},aiCopy:{color:colors.white,fontSize:12,marginTop:4,opacity:.9},quickAdd:{marginTop:14,borderRadius:18,borderWidth:1,borderColor:colors.babyPink,padding:15,backgroundColor:colors.white},quickAddText:{color:colors.primary,fontWeight:'800',textAlign:'center'},composer:{backgroundColor:colors.white,borderRadius:20,padding:14,marginTop:14,borderWidth:1,borderColor:'#E9E0F1'},textInput:{minHeight:90,color:colors.plum,fontSize:16,textAlignVertical:'top'},addButton:{backgroundColor:colors.mint,borderRadius:14,padding:13,alignItems:'center'},addText:{color:colors.plum,fontWeight:'900'},empty:{alignItems:'center',padding:48},emptyEmoji:{fontSize:42},emptyTitle:{color:colors.plum,fontSize:19,fontWeight:'900',marginTop:12},emptyCopy:{color:colors.mutedPlum,textAlign:'center',lineHeight:21,marginTop:6},task:{backgroundColor:colors.white,borderRadius:18,padding:15,marginTop:10,flexDirection:'row',alignItems:'center',borderWidth:1,borderColor:'#EEE6F2'},check:{width:30,height:30,borderRadius:15,borderWidth:2,borderColor:colors.primary,alignItems:'center',justifyContent:'center',marginRight:12},checkText:{color:colors.primary,fontWeight:'900'},taskTitle:{color:colors.plum,fontWeight:'800',fontSize:15},meta:{color:colors.mutedPlum,fontSize:11,marginTop:4,textTransform:'capitalize'},delete:{fontSize:22,color:colors.mutedPlum,paddingLeft:10}
});
