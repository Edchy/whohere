import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { spacing } from '../constants/theme';
import { useColors } from '../hooks/useColors';
import GroovyEmoji from './GroovyEmoji';

const SIZE = 120;

export default function AppHeader({ onBack }: { onBack?: () => void }) {
  const colors = useColors();
  return (
    <View style={styles.container}>
      {onBack ? (
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7} hitSlop={12}>
          <Text style={{ color: colors.textMuted, fontSize: 32, lineHeight: 36, fontWeight: '300' }}>‹</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}
      {/* <MeltsMascot size={SIZE} /> */}
      <TouchableOpacity onPress={onBack ?? (() => router.replace('/'))} activeOpacity={0.7}>
        <GroovyEmoji size={SIZE} />
      </TouchableOpacity>
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
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
