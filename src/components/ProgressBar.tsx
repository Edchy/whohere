import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radius } from '../constants/theme';

type Props = {
  progress: number; // 0 to 1
  color?: string;
};

export function ProgressBar({ progress, color = colors.accent }: Props) {
  return (
    <View style={styles.track}>
      <View
        style={[
          styles.fill,
          {
            width: `${Math.min(Math.max(progress, 0), 1) * 100}%`,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.full,
  },
});
