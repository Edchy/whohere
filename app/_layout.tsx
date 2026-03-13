import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../src/constants/theme';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Paquito-Medium': require('../assets/fonts/Paquito-Medium.otf'),
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
    </SafeAreaProvider>
  );
}
