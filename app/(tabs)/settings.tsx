import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { animation, AppColors, radius, spacing, typography } from '../../src/constants/theme';
import ScreenLayout from '../../src/components/ScreenLayout';
import { useColors } from '../../src/hooks/useColors';
import { useGameStore } from '../../src/store/gameStore';

// ─── Shared indicator components ──────────────────────────────────────────────

function TogglePill({ active }: { active: boolean }) {
  const colors = useColors();
  return (
    <View style={{
      width: 36,
      height: 20,
      borderRadius: 10,
      backgroundColor: active ? colors.accent : 'transparent',
      borderWidth: 1.5,
      borderColor: active ? colors.accent : colors.border,
      justifyContent: 'center',
      paddingHorizontal: 3,
      alignItems: active ? 'flex-end' : 'flex-start',
    }}>
      <View style={{
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: active ? colors.bgPrimary : colors.border,
      }} />
    </View>
  );
}

function Chevron() {
  const colors = useColors();
  return (
    <Text style={{ color: colors.textMuted, fontSize: 18, lineHeight: 22, fontWeight: '300' }}>›</Text>
  );
}

const COLOR_SCHEME_KEY = '@whohere/colorScheme';
const HAPTICS_KEY = '@whohere/hapticsEnabled';
const CARD_BACK_KEY = '@whohere/cardBackStyle';

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    scroll: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: 120,
      gap: spacing.md,
    },
    grid: {
      gap: spacing.md,
    },
    row: {
      overflow: 'hidden',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.accent + '18',
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
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
      borderColor: colors.bgSecondary,
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

function AnimatedRow({ onPress, right, children }: { onPress?: () => void; right?: React.ReactNode; children: (colors: AppColors) => React.ReactNode }) {
  const colors = useColors();
  const styles = makeStyles(colors);
  const colorScheme = useGameStore((s) => s.colorScheme);
  const opacity = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.timing(opacity, { toValue: 0.75, duration: animation.press, useNativeDriver: true }).start();

  const onPressOut = () =>
    Animated.timing(opacity, { toValue: 1, duration: animation.base, useNativeDriver: true }).start();

  const glassContent = (
    <>
      {Platform.OS !== 'web' && colorScheme === 'dark' && (
        <BlurView style={StyleSheet.absoluteFillObject} intensity={20} tint="dark" />
      )}
      {colorScheme === 'light' && (
        <>
          <LinearGradient
            colors={[colors.accent + '15', 'transparent']}
            locations={[0, 0.6]}
            start={{ x: 1, y: 0 }}
            end={{ x: 0.2, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <LinearGradient
            colors={[colors.accent + '15', 'transparent']}
            locations={[0, 0.6]}
            start={{ x: 0, y: 1 }}
            end={{ x: 0.8, y: 0 }}
            style={StyleSheet.absoluteFillObject}
          />
        </>
      )}
    </>
  );

  const inner = (
    <>
      {glassContent}
      {children(colors)}
      {right && <View style={{ marginLeft: 'auto' }}>{right}</View>}
    </>
  );

  if (!onPress) {
    return <View style={styles.row}>{inner}</View>;
  }

  return (
    <Animated.View style={{ opacity }}>
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
        style={styles.row}
      >
        {inner}
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
          <AnimatedRow
            onPress={() => {
              const next = colorScheme === 'dark' ? 'light' : 'dark';
              setColorScheme(next);
              AsyncStorage.setItem(COLOR_SCHEME_KEY, next);
            }}
            right={<TogglePill active={colorScheme === 'dark'} />}
          >
            {(c) => (
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>UTSEENDE</Text>
                <Text style={styles.rowSublabel}>Dark mode</Text>
              </View>
            )}
          </AnimatedRow>

          <AnimatedRow
            onPress={() => {
              const next = !hapticsEnabled;
              setHapticsEnabled(next);
              AsyncStorage.setItem(HAPTICS_KEY, String(next));
            }}
            right={<TogglePill active={hapticsEnabled} />}
          >
            {(c) => (
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>HAPTIK</Text>
                <Text style={styles.rowSublabel}>Vibrera när du byter kort</Text>
              </View>
            )}
          </AnimatedRow>

          <AnimatedRow onPress={() => router.push('/settings/card-back')} right={<Chevron />}>
            {(c) => (
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>KORTBAKSIDA</Text>
                <Text style={styles.rowSublabel}>{cardBackLabel}</Text>
              </View>
            )}
          </AnimatedRow>

          <AnimatedRow
            onPress={() => {
              AsyncStorage.removeItem('@whohere/hasSeenOnboarding');
              setHasSeenOnboarding(false);
              router.push({ pathname: '/onboarding', params: { from: 'settings' } });
            }}
            right={<Chevron />}
          >
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
          <Text style={styles.appTagline}>Intuitiva mikrohistorier om människorna omkring dig.</Text>
          <View style={styles.divider} />
          <Text style={styles.appDesc}>
            Tre lägen. Inget internet. Inga konton.{'\n'}
            Bara appen och människorna runt dig.
          </Text>
          <Text style={styles.version}>v1.0.0</Text>
        </View>

      </ScrollView>
      <LinearGradient
        colors={[colors.bgPrimary + '00', colors.bgPrimary + 'EE', colors.bgPrimary]}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 220, pointerEvents: 'none' }}
      />
    </ScreenLayout>
  );
}
