import React from 'react';
import { View } from 'react-native';
import { radius } from '../constants/theme';
import { useColors } from '../hooks/useColors';

type Props = {
  progress: number; // 0 to 1
  color?: string;
};

export function ProgressBar({ progress, color }: Props) {
  const colors = useColors();
  const trackColor = colors.border;
  const fillColor = color ?? colors.accent;

  return (
    <View style={{ height: 4, backgroundColor: trackColor, borderRadius: radius.full, overflow: 'hidden' }}>
      <View
        style={{
          height: '100%',
          borderRadius: radius.full,
          width: `${Math.min(Math.max(progress, 0), 1) * 100}%`,
          backgroundColor: fillColor,
        }}
      />
    </View>
  );
}
