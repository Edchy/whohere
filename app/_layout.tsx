import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { darkColors, lightColors } from '../src/constants/theme';
import { useGameStore } from '../src/store/gameStore';

const ONBOARDING_KEY = '@whohere/hasSeenOnboarding';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Supreme': require('../assets/fonts/Supreme-Extrabold.otf'),
   'Hedvig': require('../assets/fonts/HedvigLettersSerif-Regular.otf'), 'Pecita': require('../assets/fonts/Pecita.otf'),  'Seasum': require('../assets/fonts/seasum.otf'), 'Seasum2': require('../assets/fonts/seasum2.otf'),'Nafta': require('../assets/fonts/NaftaLight-Regular.ttf'),  'MonumentBlack': require('../assets/fonts/PPMonumentNormal-Black.otf'), 'MonumentLight': require('../assets/fonts/PPMonumentNormal-Light.otf'), 'MonumentRegular': require('../assets/fonts/PPMonumentNormal-Regular.otf'), 'Raleway-Bold' : require('../assets/fonts/Raleway-Bold.otf'), 'Raleway-Thin' : require('../assets/fonts/Raleway-Thin.otf'), 'Raleway-Regular' : require('../assets/fonts/Raleway-Regular.otf'),
  });

  const colorScheme = useGameStore((s) => s.colorScheme);
  const colors = colorScheme === 'light' ? lightColors : darkColors;
  const setHasSeenOnboarding = useGameStore((s) => s.setHasSeenOnboarding);
  const hydrated = useRef(false);

  useEffect(() => {
    if (!fontsLoaded) return;
    if (hydrated.current) return;
    hydrated.current = true;
    AsyncStorage.getItem(ONBOARDING_KEY).then((value) => {
      if (value === 'true') {
        setHasSeenOnboarding(true);
      } else {
        router.replace('/onboarding');
      }
    });
  }, [fontsLoaded]);

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: '#000000' }} />;

  return (
    <SafeAreaProvider>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
          <Stack.Screen name="onboarding" options={{ presentation: 'fullScreenModal', gestureEnabled: false, headerShown: false }} />
          <Stack.Screen name="play/categories" options={{ presentation: "modal" }} />
          <Stack.Screen name="play/[deckId]" options={{ presentation: "card" }} />
          <Stack.Screen name="settings/card-back" options={{ presentation: "card" }} />
        </Stack>
    </SafeAreaProvider>
  );
}
