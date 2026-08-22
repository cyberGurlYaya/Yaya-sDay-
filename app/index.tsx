import { StyleSheet, Text, View } from 'react-native';

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.flower}>🌸</Text>
      <Text style={styles.title}>Yaya'sDay</Text>
      <Text style={styles.subtitle}>Your day is about to feel a little more like you.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF9F2',
    padding: 32,
  },
  flower: {
    fontSize: 56,
    marginBottom: 18,
  },
  title: {
    color: '#3D3155',
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#6B607C',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 12,
    textAlign: 'center',
  },
});
