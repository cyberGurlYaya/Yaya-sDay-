import { router } from 'expo-router';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../src/theme/colors';

const features = ['Unlimited Yaya planning','Adaptive rescheduling','Voice-first task capture','Prayer-aware Muslim Mode','Smart reminders','Focus Mode','Advanced personalization'];
export default function Premium() {
  return <SafeAreaView style={styles.page}><ScrollView contentContainerStyle={styles.content}>
    <Pressable onPress={() => router.back()}><Text style={styles.back}>‹ Back</Text></Pressable>
    <Text style={styles.eyebrow}>YAYA'SDAY PLUS ✨</Text>
    <Text style={styles.title}>Let Yaya do more of the heavy lifting.</Text>
    <Text style={styles.subtitle}>The free experience stays useful. Plus unlocks the deeper companion features that make Yaya feel truly personal.</Text>
    <View style={styles.price}><Text style={styles.priceLabel}>Launch plan</Text><Text style={styles.priceValue}>₦2,500<Text style={styles.per}> / month</Text></Text><Text style={styles.priceCopy}>Pricing is a launch placeholder until payment and market testing are connected.</Text></View>
    <View style={styles.card}>{features.map(feature => <Text key={feature} style={styles.feature}>✓  {feature}</Text>)}</View>
    <Pressable style={styles.cta} onPress={() => undefined}><Text style={styles.ctaText}>Join Plus when payments are ready 💜</Text></Pressable>
    <Text style={styles.note}>No payment is collected by this prototype. Production billing will be connected through a verified subscription/payment provider and server-side entitlement checks.</Text>
  </ScrollView></SafeAreaView>;
}
const styles=StyleSheet.create({page:{flex:1,backgroundColor:colors.cream},content:{padding:22,paddingTop:30,paddingBottom:50},back:{color:colors.primary,fontWeight:'800',marginBottom:20},eyebrow:{color:colors.primary,fontWeight:'900',letterSpacing:1.2},title:{color:colors.plum,fontSize:32,lineHeight:38,fontWeight:'900',marginTop:10},subtitle:{color:colors.mutedPlum,fontSize:15,lineHeight:22,marginTop:10,marginBottom:18},price:{backgroundColor:colors.primary,borderRadius:24,padding:20,marginBottom:14},priceLabel:{color:colors.white,fontWeight:'800'},priceValue:{color:colors.white,fontSize:34,fontWeight:'900',marginTop:6},per:{fontSize:14,fontWeight:'700'},priceCopy:{color:colors.white,opacity:.9,fontSize:11,lineHeight:17,marginTop:5},card:{backgroundColor:colors.white,borderRadius:22,padding:18,borderWidth:1,borderColor:'#EEE6F2'},feature:{color:colors.plum,fontSize:15,fontWeight:'700',paddingVertical:8},cta:{backgroundColor:colors.mint,borderRadius:18,padding:16,alignItems:'center',marginTop:14},ctaText:{color:colors.plum,fontWeight:'900'},note:{color:colors.mutedPlum,fontSize:11,lineHeight:17,textAlign:'center',marginTop:14}});
