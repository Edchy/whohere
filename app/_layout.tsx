import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../src/constants/theme';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Supreme-Extrabold': require('../assets/fonts/Supreme-Extrabold.otf'),
    'Sig': require('../assets/fonts/Sig.otf'), 'Cas': require('../assets/fonts/cas-reg.otf'),
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
          <Stack.Screen name="play/categories" options={{ presentation: "modal" }} />
          <Stack.Screen name="play/[deckId]" options={{ presentation: "card" }} />
        </Stack>
    </SafeAreaProvider>
  );
}
