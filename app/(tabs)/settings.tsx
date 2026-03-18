import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import MoonIcon from '../../assets/icons/noun-moon-4373688.svg';
import SunIcon from '../../assets/icons/noun-sun-4373690.svg';
import { animation, AppColors, fonts, radius, spacing, typography } from '../../src/constants/theme';
import ScreenLayout from '../../src/components/ScreenLayout';
import { useColors } from '../../src/hooks/useColors';
import { useGameStore } from '../../src/store/gameStore';

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    scroll: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.xxxl,
      gap: spacing.sm,
    },
    row: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.bgSecondary,
      flexDirection: 'row',
      alignItems: 'center',
    },
    rowText: {
      flex: 1,
      gap: 2,
    },
    rowLabel: {
      ...typography.body,
      fontFamily: fonts.heading,
      fontSize: 24,
      textTransform: 'uppercase',
      color: colors.textPrimary,
    },
    rowSublabel: {
      ...typography.caption,
      opacity: 0.8,
      color: colors.textSecondary,
    },
    infoBlock: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.bgSecondary,
      gap: spacing.sm,
    },
    appName: {
      ...typography.body,
      fontFamily: fonts.heading,
      fontSize: 24,
      textTransform: 'uppercase',
      color: colors.textPrimary,
    },
    appTagline: {
      ...typography.caption,
      opacity: 0.8,
      color: colors.textSecondary,
      fontStyle: 'italic',
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: spacing.sm,
    },
    appDesc: {
      ...typography.caption,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    version: {
      ...typography.label,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    toggle: {
      width: 36,
      height: 36,
      borderRadius: radius.md,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    toggleText: {
      ...typography.caption,
    },
  });
}

function AnimatedRow({ onPress, children }: { onPress?: () => void; children: (colors: AppColors) => React.ReactNode }) {
  const colors = useColors();
  const styles = makeStyles(colors);
  const opacity = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.timing(opacity, { toValue: 0.75, duration: animation.press, useNativeDriver: true }).start();

  const onPressOut = () =>
    Animated.timing(opacity, { toValue: 1, duration: animation.base, useNativeDriver: true }).start();

  if (!onPress) {
    return <View style={styles.row}>{children(colors)}</View>;
  }

  return (
    <Animated.View style={{ opacity }}>
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
        style={styles.row}
      >
        {children(colors)}
      </Pressable>
    </Animated.View>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const styles = makeStyles(colors);

  const hapticsEnabled = useGameStore((s) => s.hapticsEnabled);
  const setHapticsEnabled = useGameStore((s) => s.setHapticsEnabled);
  const colorScheme = useGameStore((s) => s.colorScheme);
  const setColorScheme = useGameStore((s) => s.setColorScheme);
  const cardBackStyle = useGameStore((s) => s.cardBackStyle);

  const cardBackLabel =
    cardBackStyle === 'plain' ? 'Enfärgad' :
    cardBackStyle === 'chevron' ? 'Curtain' :
    cardBackStyle === 'bubbles' ? 'Moroccan' :
    cardBackStyle === 'polka' ? 'Polka Dots' :
    cardBackStyle === 'tictactoe' ? 'Tic Tac Toe' :
    'Skulls';

  return (
    <ScreenLayout>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <AnimatedRow onPress={() => setColorScheme(colorScheme === 'dark' ? 'light' : 'dark')}>
          {(c) => (
            <>
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>Utseende</Text>
                <Text style={styles.rowSublabel}>{colorScheme === 'dark' ? 'Mörkt läge' : 'Ljust läge'}</Text>
              </View>
              {colorScheme === 'dark' ? (
                <SunIcon width={20} height={20} fill={colors.textPrimary} />
              ) : (
                <MoonIcon width={20} height={20} fill={colors.textPrimary} />
              )}
            </>
          )}
        </AnimatedRow>

        <AnimatedRow onPress={() => setHapticsEnabled(!hapticsEnabled)}>
          {(c) => (
            <>
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>Haptik</Text>
                <Text style={styles.rowSublabel}>Vibrera när du byter kort</Text>
              </View>
              <View style={[
                styles.toggle,
                {
                  borderColor: hapticsEnabled ? colors.accent : colors.border,
                  backgroundColor: hapticsEnabled ? colors.accentDim : 'transparent',
                },
              ]}>
                <Text style={[styles.toggleText, { color: hapticsEnabled ? colors.accent : colors.textMuted }]}>
                  {hapticsEnabled ? 'På' : 'Av'}
                </Text>
              </View>
            </>
          )}
        </AnimatedRow>

        <AnimatedRow onPress={() => router.push('/settings/card-back')}>
          {(c) => (
            <>
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>Kortbaksida</Text>
                <Text style={styles.rowSublabel}>{cardBackLabel}</Text>
              </View>
              <Text style={[styles.rowSublabel, { fontSize: 18, opacity: 1 }]}>›</Text>
            </>
          )}
        </AnimatedRow>

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

      </ScrollView>
    </ScreenLayout>
  );
}
