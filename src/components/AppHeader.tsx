import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { spacing } from '../constants/theme';
import { useColors } from '../hooks/useColors';
import EyesLogo from './EyesLogo';

export default function AppHeader({ onBack }: { onBack?: () => void }) {
  const colors = useColors();
  return (
    <View style={styles.container}>
      {onBack ? (
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={colors.textMuted} />
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}
      <EyesLogo size={72} />
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  spacer: {
    flex: 1,
  },
  backButton: {
    flex: 1,
  },
});
