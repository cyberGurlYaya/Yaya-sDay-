import { router } from 'expo-router';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../src/theme/colors';

export default function KidsMode() {
  return <SafeAreaView style={styles.page}><ScrollView contentContainerStyle={styles.content}>
    <Pressable onPress={() => router.back()}><Text style={styles.back}>‹ Back</Text></Pressable>
    <Text style={styles.title}>Kids Mode 🧸</Text>
    <Text style={styles.subtitle}>A family layer where a parent can connect to a child's Yaya and help guide routines without turning the app into surveillance.</Text>
    <View style={styles.hero}><Text style={styles.heroEmoji}>👩🏽‍👧🏽💜</Text><Text style={styles.heroTitle}>Parent ↔ Child connection</Text><Text style={styles.heroCopy}>Parents can create or assign age-appropriate tasks, set routine expectations and see selected progress. The child gets reminders from Yaya in their own app.</Text></View>
    <Card title="Parent controls" items={['Invite/connect a child securely','Create tasks for the child','Set routine windows and reminders','View selected completion/progress','Manage permissions and disconnect anytime']} />
    <Card title="Child experience" items={['Receive Yaya reminders','See parent-assigned tasks clearly','Complete or ask Yaya for help','Keep private personal notes separate','Get encouragement instead of shame']} />
    <View style={styles.note}><Text style={styles.noteTitle}>Privacy by design 🔐</Text><Text style={styles.noteCopy}>The production version will use authenticated parent-child links, explicit consent, least-privilege data sharing and auditable connection controls. This screen is the user-testing shell; the secure family backend comes before public Kids Mode release.</Text></View>
  </ScrollView></SafeAreaView>;
}
function Card({title,items}:{title:string;items:string[]}){return <View style={styles.card}><Text style={styles.cardTitle}>{title}</Text>{items.map(x=><Text key={x} style={styles.item}>• {x}</Text>)}</View>}
const styles=StyleSheet.create({page:{flex:1,backgroundColor:colors.cream},content:{padding:22,paddingTop:30,paddingBottom:45},back:{color:colors.primary,fontWeight:'800',marginBottom:20},title:{fontSize:30,fontWeight:'900',color:colors.plum},subtitle:{fontSize:15,lineHeight:22,color:colors.mutedPlum,marginTop:7,marginBottom:18},hero:{backgroundColor:colors.babyPink,borderRadius:24,padding:22,alignItems:'center',marginBottom:14},heroEmoji:{fontSize:42},heroTitle:{fontSize:18,fontWeight:'900',color:colors.plum,marginTop:10},heroCopy:{fontSize:13,lineHeight:20,color:colors.plum,textAlign:'center',marginTop:6},card:{backgroundColor:colors.white,borderRadius:20,padding:18,marginBottom:12,borderWidth:1,borderColor:'#EEE6F2'},cardTitle:{color:colors.plum,fontWeight:'900',fontSize:17,marginBottom:9},item:{color:colors.mutedPlum,fontSize:13,lineHeight:24},note:{backgroundColor:colors.mint,borderRadius:20,padding:18},noteTitle:{color:colors.plum,fontWeight:'900'},noteCopy:{color:colors.plum,fontSize:12,lineHeight:19,marginTop:5}});
