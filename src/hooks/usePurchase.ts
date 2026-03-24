import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { useGameStore } from '../store/gameStore';

const PREMIUM_KEY = '@whohere/isPremium';

export function usePurchase() {
  const isPremium = useGameStore((s) => s.isPremium);
  const setIsPremium = useGameStore((s) => s.setIsPremium);

  const purchasePremium = (): Promise<boolean> => {
    return new Promise((resolve) => {
      Alert.alert(
        'Lås upp allt',
        'En engångskostnad på 69 kr. Spela alla kortlekar utan begränsningar, för alltid.',
        [
          { text: 'Avbryt', style: 'cancel', onPress: () => resolve(false) },
          {
            text: 'Köp för 69 kr',
            onPress: async () => {
              await AsyncStorage.setItem(PREMIUM_KEY, 'true');
              setIsPremium(true);
              resolve(true);
            },
          },
        ]
      );
    });
  };

  const resetPremium = async () => {
    await AsyncStorage.removeItem(PREMIUM_KEY);
    setIsPremium(false);
  };

  const restorePurchases = async () => {
    const value = await AsyncStorage.getItem(PREMIUM_KEY);
    if (value === 'true') {
      setIsPremium(true);
      Alert.alert('Återställt', 'Ditt köp har återställts.');
    } else {
      Alert.alert('Inget köp hittades', 'Vi kunde inte hitta något tidigare köp.');
    }
  };

  return { isPremium, purchasePremium, restorePurchases, resetPremium };
}
