import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppColors, fonts, radius, spacing, typography } from '../constants/theme';

type EndCardProps = {
  variant: 'paywall' | 'completion';
  onUnlock: () => void;
  onReplay: () => void;
  onHome: () => void;
  colors: AppColors;
};

export function EndCard({ variant, onUnlock, onReplay, onHome, colors }: EndCardProps) {
  const s = makeStyles(colors);

  if (variant === 'paywall') {
    return (
      <View style={s.container}>
        <View style={s.content}>
          <Text style={s.mark}>✦</Text>
          <Text style={s.title}>Vill ni fortsätta?</Text>
          <Text style={s.body}>
            Lås upp alla kortlekar och spela utan begränsningar.
          </Text>
        </View>
        <View style={s.actions}>
          <Pressable style={s.primaryBtn} onPress={onUnlock}>
            <Text style={s.primaryBtnText}>Lås upp — 69 kr</Text>
          </Pressable>
          <Pressable style={s.secondaryBtn} onPress={onHome}>
            <Text style={s.secondaryBtnText}>Avsluta ändå</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.content}>
        <Text style={s.mark}>✦</Text>
        <Text style={s.title}>Sessionen är klar.</Text>
        <Text style={s.body}>Bra samtal tar tid att landa.</Text>
      </View>
      <View style={s.actions}>
        <Pressable style={s.primaryBtn} onPress={onReplay}>
          <Text style={s.primaryBtnText}>Spela igen</Text>
        </Pressable>
        <Pressable style={s.secondaryBtn} onPress={onHome}>
          <Text style={s.secondaryBtnText}>Gå hem</Text>
        </Pressable>
      </View>
    </View>
  );
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: spacing.lg,
      justifyContent: 'space-between',
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.md,
    },
    mark: {
      fontSize: 32,
      color: colors.accent,
      marginBottom: spacing.sm,
    },
    title: {
      fontFamily: fonts.bold,
      fontSize: 22,
      lineHeight: 28,
      color: colors.textPrimary,
      textAlign: 'center',
      letterSpacing: -0.3,
    },
    body: {
      fontFamily: fonts.regular,
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    actions: {
      gap: spacing.sm,
      paddingBottom: spacing.md,
    },
    primaryBtn: {
      backgroundColor: colors.accent,
      borderRadius: radius.md,
      paddingVertical: spacing.md,
      alignItems: 'center',
    },
    primaryBtnText: {
      fontFamily: fonts.bold,
      fontSize: 14,
      letterSpacing: 0.5,
      color: colors.bgPrimary,
    },
    secondaryBtn: {
      paddingVertical: spacing.sm,
      alignItems: 'center',
    },
    secondaryBtnText: {
      fontFamily: fonts.regular,
      fontSize: 14,
      color: colors.textMuted,
    },
  });
}
