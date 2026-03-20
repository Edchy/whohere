import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { animation, AppColors, radius, spacing, typography } from '../../src/constants/theme';
import ScreenLayout from '../../src/components/ScreenLayout';
import { useColors } from '../../src/hooks/useColors';
import { useGameStore } from '../../src/store/gameStore';

const COLOR_SCHEME_KEY = '@whohere/colorScheme';
const HAPTICS_KEY = '@whohere/hapticsEnabled';
const CARD_BACK_KEY = '@whohere/cardBackStyle';

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    scroll: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.xxxl,
      gap: spacing.md,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
    },
    row: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.bgSecondary,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    rowLight: {
      backgroundColor: 'transparent',
    },
    rowText: {
      flex: 1,
      gap: 0,
    },
    rowLabel: {
      ...typography.heading,
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
    infoBlockLight: {
      backgroundColor: 'transparent',
    },
    appName: {
      ...typography.brand,
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
      ...typography.badge,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
  });
}

function AnimatedRow({ onPress, backgroundColor, children }: { onPress?: () => void; backgroundColor?: string; children: (colors: AppColors) => React.ReactNode }) {
  const colors = useColors();
  const styles = makeStyles(colors);
  const colorScheme = useGameStore((s) => s.colorScheme);
  const opacity = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.timing(opacity, { toValue: 0.75, duration: animation.press, useNativeDriver: true }).start();

  const onPressOut = () =>
    Animated.timing(opacity, { toValue: 1, duration: animation.base, useNativeDriver: true }).start();

  const tileStyle = [
    styles.row,
    colorScheme === 'light' ? styles.rowLight : undefined,
    backgroundColor ? { backgroundColor, borderColor: backgroundColor } : undefined,
  ];

  if (!onPress) {
    return <View style={[tileStyle, { width: '47%' }]}>{children(colors)}</View>;
  }

  return (
    <Animated.View style={{ opacity, width: '47%' }}>
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
        style={tileStyle}
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
  const setHasSeenOnboarding = useGameStore((s) => s.setHasSeenOnboarding);

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

        <View style={styles.grid}>
          <AnimatedRow onPress={() => {
            const next = colorScheme === 'dark' ? 'light' : 'dark';
            setColorScheme(next);
            AsyncStorage.setItem(COLOR_SCHEME_KEY, next);
          }}>
            {(c) => (
              <>
                <View style={styles.rowText}>
                  <Text style={styles.rowLabel}>UTSEENDE</Text>
                  <Text style={styles.rowSublabel}>{colorScheme === 'dark' ? 'Mörkt läge' : 'Ljust läge'}</Text>
                </View>
                {colorScheme === 'dark' ? (
                  <SunIcon width={16} height={16} fill={colors.textMuted} />
                ) : (
                  <MoonIcon width={16} height={16} fill={colors.textMuted} />
                )}
              </>
            )}
          </AnimatedRow>

          <AnimatedRow onPress={() => {
            const next = !hapticsEnabled;
            setHapticsEnabled(next);
            AsyncStorage.setItem(HAPTICS_KEY, String(next));
          }} backgroundColor={hapticsEnabled ? colors.bgBrand : undefined}>
            {(c) => (
              <View style={styles.rowText}>
                <Text style={[styles.rowLabel, hapticsEnabled ? { color: colors.textOnBrand } : undefined]}>HAPTIK</Text>
                <Text style={[styles.rowSublabel, hapticsEnabled ? { color: colors.textOnBrand, opacity: 0.7 } : undefined]}>Vibrera när du byter kort</Text>
              </View>
            )}
          </AnimatedRow>

          <AnimatedRow onPress={() => router.push('/settings/card-back')}>
            {(c) => (
              <>
                <View style={styles.rowText}>
                  <Text style={styles.rowLabel}>KORTBAKSIDA</Text>
                  <Text style={styles.rowSublabel}>{cardBackLabel}</Text>
                </View>
                <Text style={[styles.rowSublabel, { fontSize: 18, opacity: 1 }]}>›</Text>
              </>
            )}
          </AnimatedRow>

          <AnimatedRow onPress={() => {
            AsyncStorage.removeItem('@whohere/hasSeenOnboarding');
            setHasSeenOnboarding(false);
            router.replace('/onboarding');
          }}>
            {(c) => (
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>INTRO</Text>
                <Text style={styles.rowSublabel}>Visa igen</Text>
              </View>
            )}
          </AnimatedRow>
        </View>

        <View style={[styles.infoBlock, colorScheme === 'light' ? styles.infoBlockLight : undefined]}>
          <Text style={styles.appName}>Vem här...?</Text>
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
