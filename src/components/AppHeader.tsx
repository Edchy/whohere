import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { spacing, typography } from '../constants/theme';
import { useColors } from '../hooks/useColors';
import EyesLogo from './EyesLogo';

const SIZE = 120;

const AppHeader = React.memo(function AppHeader({ onBack }: { onBack?: () => void }) {
  const colors = useColors();
  return (
    <View style={styles.container}>
      <View style={styles.wordmark} />
      <TouchableOpacity
        onPress={onBack ?? (() => router.replace('/'))}
        activeOpacity={0.7}
        accessibilityLabel="Hem"
        accessibilityRole="button"
      >
        <EyesLogo size={SIZE} />
      </TouchableOpacity>
      {onBack ? (
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.7}
          hitSlop={12}
          accessibilityLabel="Gå tillbaka"
          accessibilityRole="button"
        >
          <Text style={[styles.navIcon, { color: colors.textMuted }]}>‹</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}
    </View>
  );
});

export default AppHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.xl,
  },
  spacer: {
    flex: 1,
  },
  wordmark: {
    flex: 1,
    justifyContent: 'center',
  },
  backButton: {
    flex: 1,
    alignItems: 'flex-end',
    minHeight: 44,
    justifyContent: 'center',
  },
  navIcon: {
    ...typography.display,
    fontWeight: '300',
    textAlign: 'right',
  },
});
