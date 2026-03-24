import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Platform, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { darkColors, lightColors } from '../src/constants/theme';
import { useGameStore } from '../src/store/gameStore';

SplashScreen.preventAutoHideAsync();

const ONBOARDING_KEY = '@whohere/hasSeenOnboarding';
const COLOR_SCHEME_KEY = '@whohere/colorScheme';
const HAPTICS_KEY = '@whohere/hapticsEnabled';
const CARD_BACK_KEY = '@whohere/cardBackStyle';
const PREMIUM_KEY = '@whohere/isPremium';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'AuthorBold': require('../assets/fonts/Author-Bold.otf'),
    'AuthorRegular': require('../assets/fonts/Author-Regular.otf'),
    'AuthorExtralight': require('../assets/fonts/Author-Extralight.otf'),
  });

  const systemColorScheme = useColorScheme();
  const colorScheme = useGameStore((s) => s.colorScheme);
  const colors = colorScheme === 'light' ? lightColors : darkColors;
  const setHasSeenOnboarding = useGameStore((s) => s.setHasSeenOnboarding);
  const setColorScheme = useGameStore((s) => s.setColorScheme);
  const setHapticsEnabled = useGameStore((s) => s.setHapticsEnabled);
  const setCardBackStyle = useGameStore((s) => s.setCardBackStyle);
  const setIsPremium = useGameStore((s) => s.setIsPremium);
  const hydrated = useRef(false);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (!fontsLoaded) return;
    if (hydrated.current) return;
    hydrated.current = true;
    Promise.all([
      AsyncStorage.getItem(ONBOARDING_KEY),
      AsyncStorage.getItem(COLOR_SCHEME_KEY),
      AsyncStorage.getItem(HAPTICS_KEY),
      AsyncStorage.getItem(CARD_BACK_KEY),
      AsyncStorage.getItem(PREMIUM_KEY),
    ]).then(([onboardingValue, colorSchemeValue, hapticsValue, cardBackValue, premiumValue]) => {
      if (colorSchemeValue === 'dark' || colorSchemeValue === 'light') {
        setColorScheme(colorSchemeValue);
      } else {
        setColorScheme(systemColorScheme === 'light' ? 'light' : 'dark');
      }
      if (hapticsValue !== null) {
        setHapticsEnabled(hapticsValue === 'true');
      }
      if (cardBackValue) {
        setCardBackStyle(cardBackValue as Parameters<typeof setCardBackStyle>[0]);
      }
      if (premiumValue === 'true') {
        setIsPremium(true);
      }
      if (onboardingValue === 'true') {
        setHasSeenOnboarding(true);
      } else {
        router.replace('/onboarding');
      }
    });
  }, [fontsLoaded]);

  // Keep in sync with system if no user override is saved
  useEffect(() => {
    AsyncStorage.getItem(COLOR_SCHEME_KEY).then((saved) => {
      if (!saved) {
        setColorScheme(systemColorScheme === 'light' ? 'light' : 'dark');
      }
    });
  }, [systemColorScheme]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <View style={Platform.OS === 'web' ? {
        flex: 1,
        alignItems: 'center',
        backgroundColor: colors.bgPrimary,
      } : { flex: 1 }}>
        <View style={Platform.OS === 'web' ? {
          flex: 1,
          width: '100%',
          maxWidth: 480,
        } : { flex: 1 }}>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
            <Stack.Screen name="onboarding" options={{ presentation: Platform.OS === 'web' ? 'card' : 'fullScreenModal', gestureEnabled: false, headerShown: false }} />
            <Stack.Screen name="play/categories" options={{ presentation: "modal" }} />
            <Stack.Screen name="play/[deckId]" options={{ presentation: "card" }} />
            <Stack.Screen name="decks/[deckId]" options={{ presentation: "modal" }} />
            <Stack.Screen name="settings/card-back" options={{ presentation: "card" }} />
          </Stack>
        </View>
      </View>
    </SafeAreaProvider>
  );
}
