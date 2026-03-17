import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../src/constants/theme';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Supreme': require('../assets/fonts/Supreme-Extrabold.otf'),
   'Hedvig': require('../assets/fonts/HedvigLettersSerif-Regular.otf'), 'Pecita': require('../assets/fonts/Pecita.otf'),  'Seasum': require('../assets/fonts/seasum.otf'), 'Seasum2': require('../assets/fonts/seasum2.otf'),'Nafta': require('../assets/fonts/NaftaLight-Regular.ttf'),  'MonumentBlack': require('../assets/fonts/PPMonumentNormal-Black.otf'), 'MonumentLight': require('../assets/fonts/PPMonumentNormal-Light.otf'), 'MonumentRegular': require('../assets/fonts/PPMonumentNormal-Regular.otf'), 'Raleway-Black' : require('../assets/fonts/Raleway-Black.otf'),
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
