import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { colors, spacing } from '../constants/theme';
import EyesLogo from './EyesLogo';

export default function AppHeader({ onBack }: { onBack?: () => void }) {
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
      <TouchableOpacity style={styles.helpButton} activeOpacity={0.7}>
        <Ionicons name="help-circle-outline" size={26} color={colors.textMuted} />
      </TouchableOpacity>
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
  helpButton: {
    flex: 1,
    alignItems: 'flex-end',
  },
});
