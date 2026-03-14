import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { colors, spacing, typography, radius } from '../../src/constants/theme';
import ScreenLayout from '../../src/components/ScreenLayout';
import { useGameStore } from '../../src/store/gameStore';

export default function SettingsScreen() {
  const hapticsEnabled = useGameStore((s) => s.hapticsEnabled);
  const setHapticsEnabled = useGameStore((s) => s.setHapticsEnabled);

  return (
    <ScreenLayout>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Inställningar</Text>
        </View>

        <View style={styles.group}>
          <Text style={styles.groupLabel}>INSTÄLLNINGAR</Text>
          <View style={styles.row}>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>Haptik</Text>
              <Text style={styles.rowSub}>Vibrera när du byter kort</Text>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={setHapticsEnabled}
              trackColor={{ false: colors.border, true: colors.accentSoft }}
              thumbColor={hapticsEnabled ? colors.accent : colors.textMuted}
              ios_backgroundColor={colors.border}
            />
          </View>
        </View>

        <View style={styles.group}>
          <Text style={styles.groupLabel}>OM APPEN</Text>
          <View style={styles.infoBlock}>
            <Text style={styles.appName}>Vem här?</Text>
            <Text style={styles.appTagline}>Ett spel om hur vi läser varandra.</Text>
            <View style={styles.divider} />
            <Text style={styles.appDesc}>
              Tre lägen. Inget internet. Inga konton.{'\n'}
              Bara appen och människorna runt dig.
            </Text>
            <Text style={styles.version}>v1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  header: {
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  title: {
    ...typography.display,
    color: colors.textPrimary,
  },
  group: {
    marginBottom: spacing.xl,
  },
  groupLabel: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  rowSub: {
    ...typography.caption,
    color: colors.textMuted,
  },
  infoBlock: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  appName: {
    ...typography.heading,
    color: colors.accent,
    marginBottom: spacing.xs,
  },
  appTagline: {
    ...typography.body,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  appDesc: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  version: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
