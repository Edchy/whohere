import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppColors, radius, spacing, typography } from '../../src/constants/theme';
import { useColors } from '../../src/hooks/useColors';

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.bgPrimary,
    },
    container: {
      flex: 1,
      padding: spacing.xl,
      justifyContent: 'space-between',
    },
    top: {
      flex: 1,
      justifyContent: 'center',
    },
    label: {
      ...typography.badge,
      color: colors.accent,
      letterSpacing: 2,
      marginBottom: spacing.lg,
    },
    title: {
      ...typography.display,
      color: colors.textPrimary,
      marginBottom: spacing.lg,
    },
    subtitle: {
      ...typography.body,
      color: colors.textSecondary,
      fontStyle: 'italic',
    },
    actions: {
      gap: spacing.sm,
      paddingBottom: spacing.md,
    },
    primaryButton: {
      height: 52,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryButtonText: {
      ...typography.body,
      color: colors.accent,
      letterSpacing: 0.5,
    },
    secondaryButton: {
      height: 52,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryButtonText: {
      ...typography.body,
      color: colors.textSecondary,
    },
  });
}

export default function ResultsScreen() {
  const colors = useColors();
  const styles = makeStyles(colors);
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.top}>
          <Text style={styles.label}>KLART</Text>
          <Text style={styles.title}>Det var{'\n'}alla kort.</Text>
          <Text style={styles.subtitle}>
            De bästa samtalen börjar här, där korten tar slut.
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.replace('/')}
            activeOpacity={0.7}
          >
            <Text style={styles.primaryButtonText}>välj ett annat läge</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>spela igen</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
