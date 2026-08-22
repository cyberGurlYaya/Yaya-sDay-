import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ title: "Yaya'sDay" }} />
      <View style={styles.container}>
        <Text style={styles.title}>Oops, that page wandered off. 🌸</Text>
        <Link href="/" style={styles.link}>Take me home</Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#FFF9F2' },
  title: { color: '#3D3155', fontSize: 22, fontWeight: '700', textAlign: 'center' },
  link: { color: '#9B7EDB', fontSize: 16, fontWeight: '700', marginTop: 18 },
});
