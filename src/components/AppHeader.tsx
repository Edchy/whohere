import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { spacing } from '../constants/theme';
import { useColors } from '../hooks/useColors';
import GroovyEmoji from './GroovyEmoji';

const arrowSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200pt" height="1200pt" version="1.1" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">
 <path d="m1165.5 574.55-540-540c-6.75-6.75-15.891-10.547-25.453-10.547h-540c-19.875 0-36 16.125-36 36 0 9.5625 3.7969 18.703 10.547 25.453l514.55 514.55-514.55 514.55c-14.062 14.062-14.062 36.844 0 50.906 6.75 6.75 15.891 10.547 25.453 10.547h540c9.5625 0 18.703-3.7969 25.453-10.547l540-540c14.062-14.062 14.062-36.844 0-50.906z"/>
</svg>`;

const SIZE = 120;

export default function AppHeader({ onBack }: { onBack?: () => void }) {
  const colors = useColors();
  return (
    <View style={styles.container}>
      {onBack ? (
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7} hitSlop={12}>
          <SvgXml xml={arrowSvg.replace('<path ', `<path fill="${colors.textMuted}" `)} width={14} height={14} style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}
      {/* <MeltsMascot size={SIZE} /> */}
      <GroovyEmoji size={SIZE} />
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  spacer: {
    flex: 1,
  },
  backButton: {
    flex: 1,
  },
});
