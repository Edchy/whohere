import * as Haptics from 'expo-haptics';
import { useGameStore } from '../store/gameStore';

export function useHaptics() {
  const enabled = useGameStore((s) => s.hapticsEnabled);

  const light = () => { if (enabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };
  const medium = () => { if (enabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); };
  const heavy = () => { if (enabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); };
  const success = () => { if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); };
  const warning = () => { if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); };

  return { light, medium, heavy, success, warning };
}
