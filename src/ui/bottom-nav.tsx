import { router, usePathname } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

const items = [
  { path: '/my-day', icon: '🏠', label: 'My Day' },
  { path: '/tasks', icon: '✓', label: 'Tasks' },
  { path: '/schedule', icon: '◷', label: 'Schedule' },
  { path: '/yaya', icon: '💜', label: 'Yaya' },
];

export function BottomNav() {
  const pathname = usePathname();
  return <View style={styles.bar}>{items.map(item => {
    const active = pathname === item.path;
    return <Pressable key={item.path} onPress={() => router.replace(item.path as any)} style={[styles.item, active && styles.active]}>
      <Text style={[styles.icon, active && styles.activeText]}>{item.icon}</Text>
      <Text style={[styles.label, active && styles.activeText]}>{item.label}</Text>
    </Pressable>;
  })}</View>;
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: '#EEE6F2', paddingHorizontal: 8, paddingTop: 8, paddingBottom: 10 },
  item: { flex: 1, alignItems: 'center', paddingVertical: 6, borderRadius: 16 },
  active: { backgroundColor: '#F5F0FC' },
  icon: { color: colors.mutedPlum, fontSize: 18, fontWeight: '800' },
  label: { color: colors.mutedPlum, fontSize: 11, marginTop: 3, fontWeight: '700' },
  activeText: { color: colors.primary },
});
