import { darkColors, lightColors, AppColors } from '../constants/theme';
import { useGameStore } from '../store/gameStore';

export function useColors(): AppColors {
  const colorScheme = useGameStore((s) => s.colorScheme);
  return colorScheme === 'light' ? lightColors : darkColors;
}
