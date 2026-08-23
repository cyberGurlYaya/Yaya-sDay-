import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../src/theme/colors';
import { useAppStore } from '../src/state/app-store';
import { buildDayPlan } from '../src/scheduling/engine';
import { BottomNav } from '../src/ui/bottom-nav';

function timeLabel(iso: string) { return new Date(iso).toLocaleTimeString([], { hour:'numeric', minute:'2-digit' }); }
export default function Schedule() {
  const { tasks } = useAppStore();
  const plan = buildDayPlan(tasks);
  return <SafeAreaView style={styles.page}><ScrollView contentContainerStyle={styles.content}>
    <Text style={styles.title}>Your Rhythm ✨</Text>
    <Text style={styles.subtitle}>A realistic plan with room to breathe. Fixed commitments stay protected.</Text>
    {plan.length === 0 ? <View style={styles.empty}><Text style={styles.emoji}>🌿</Text><Text style={styles.emptyTitle}>Your schedule is waiting.</Text><Text style={styles.emptyCopy}>Add a few tasks and Yaya will arrange them without filling every minute.</Text></View> : plan.map(block => <View key={block.id} style={[styles.block, block.isProtected && styles.protected]}>
      <View style={styles.time}><Text style={styles.start}>{timeLabel(block.scheduledStart)}</Text><Text style={styles.end}>{timeLabel(block.scheduledEnd)}</Text></View>
      <View style={styles.line}><View style={styles.dot}/></View>
      <View style={{flex:1}}><Text style={styles.blockTitle}>{block.title}</Text><Text style={styles.meta}>{block.isProtected ? 'Protected time' : `${block.durationMinutes ?? 30} min · ${block.priority}`}</Text></View>
    </View>)}
  </ScrollView><BottomNav /></SafeAreaView>;
}
const styles=StyleSheet.create({page:{flex:1,backgroundColor:colors.cream},content:{padding:22,paddingTop:28,paddingBottom:35},title:{fontSize:30,fontWeight:'900',color:colors.plum},subtitle:{fontSize:15,lineHeight:22,color:colors.mutedPlum,marginTop:7,marginBottom:22},block:{backgroundColor:colors.white,borderRadius:18,padding:14,marginBottom:9,flexDirection:'row',alignItems:'center',borderWidth:1,borderColor:'#EEE6F2'},protected:{borderColor:colors.primary,backgroundColor:'#F8F3FD'},time:{width:62},start:{color:colors.plum,fontWeight:'800',fontSize:12},end:{color:colors.mutedPlum,fontSize:10,marginTop:3},line:{width:18,alignItems:'center',marginRight:10},dot:{width:9,height:9,borderRadius:5,backgroundColor:colors.babyPink},blockTitle:{color:colors.plum,fontWeight:'800',fontSize:15},meta:{color:colors.mutedPlum,fontSize:11,marginTop:4,textTransform:'capitalize'},empty:{alignItems:'center',padding:45},emoji:{fontSize:45},emptyTitle:{color:colors.plum,fontWeight:'900',fontSize:19,marginTop:12},emptyCopy:{color:colors.mutedPlum,textAlign:'center',lineHeight:21,marginTop:6}});
