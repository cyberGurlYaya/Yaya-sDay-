import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAppStore } from '../src/state/app-store';
import { colors } from '../src/theme/colors';

export default function Index() {
  const { hydrated, profile } = useAppStore();
  if (!hydrated) return <View style={{ flex:1, alignItems:'center', justifyContent:'center', backgroundColor:colors.cream }}><ActivityIndicator color={colors.primary} /></View>;
  return <Redirect href={profile.onboardingComplete ? '/my-day' : '/onboarding'} />;
}
