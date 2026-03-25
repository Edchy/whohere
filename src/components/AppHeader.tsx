import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { appName, spacing, typography } from '../constants/theme';
import { useColors } from '../hooks/useColors';
import GroovyEmoji from './GroovyEmoji';
import EyesLogo from './EyesLogo';

const SIZE = 120;

export default function AppHeader({ onBack }: { onBack?: () => void }) {
  const colors = useColors();
  return (
    <View style={styles.container}>
      <View style={styles.wordmark} />
      {/* <MeltsMascot size={SIZE} /> */}
      <TouchableOpacity onPress={onBack ?? (() => router.replace('/'))} activeOpacity={0.7}>
        {/* <GroovyEmoji size={SIZE} /> */}
        <EyesLogo size={SIZE} />
      </TouchableOpacity>
      {onBack ? (
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7} hitSlop={12}>
          <Text style={{ color: colors.textMuted, fontSize: 32, lineHeight: 36, fontWeight: '300', textAlign: 'right' }}>‹</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingBlockStart: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  spacer: {
    flex: 1,
  },
  wordmark: {
    flex: 1,
    justifyContent: 'center',
  },
  wordmarkLine: {
    ...typography.brand,
    fontSize: 13,
    lineHeight: 15,
    letterSpacing: 2,
    fontWeight: '700',
  },
  backButton: {
    flex: 1,
  },
});
