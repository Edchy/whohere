import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useRef } from 'react';
import {
  Animated,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { animation, AppColors, fonts, radius, spacing, TAB_BAR_BOTTOM_CLEARANCE, typography } from '../../src/constants/theme';
import ScreenLayout from '../../src/components/ScreenLayout';
import { useColors } from '../../src/hooks/useColors';
import { useGameStore } from '../../src/store/gameStore';
import { usePurchase } from '../../src/hooks/usePurchase';

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
    <Text style={{ color: colors.textMuted, fontSize: 18, lineHeight: 22, fontFamily: fonts.extraLight }}>›</Text>
  );
}

const COLOR_SCHEME_KEY = '@whohere/colorScheme';
const HAPTICS_KEY = '@whohere/hapticsEnabled';

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    scroll: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: TAB_BAR_BOTTOM_CLEARANCE,
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
      color: colors.textSecondary,
    },
    infoBlock: {
      paddingTop: spacing.xl,
      paddingBottom: spacing.xl,
      gap: spacing.md,
    },
    infoText: {
      fontFamily: fonts.regular,
      fontSize: 14,
      lineHeight: 22,
      color: colors.textSecondary,
    },
    infoLink: {
      fontFamily: fonts.extraLight,
      fontSize: 14,
      lineHeight: 22,
      color: colors.textPrimary,
      textDecorationLine: 'underline',
    },
    version: {
      fontFamily: fonts.regular,
      fontSize: 14,
      color: colors.textMuted,
      marginTop: spacing.xl,
    },
  });
}

function AnimatedRow({ onPress, right, children }: { onPress?: () => void; right?: React.ReactNode; children: (colors: AppColors) => React.ReactNode }) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const colorScheme = useGameStore((s) => s.colorScheme);
  const opacity = useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() =>
    Animated.timing(opacity, { toValue: 0.75, duration: animation.press, useNativeDriver: true }).start(), []);

  const onPressOut = useCallback(() =>
    Animated.timing(opacity, { toValue: 1, duration: animation.base, useNativeDriver: true }).start(), []);

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
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const hapticsEnabled = useGameStore((s) => s.hapticsEnabled);
  const setHapticsEnabled = useGameStore((s) => s.setHapticsEnabled);
  const colorScheme = useGameStore((s) => s.colorScheme);
  const setColorScheme = useGameStore((s) => s.setColorScheme);
  const setHasSeenOnboarding = useGameStore((s) => s.setHasSeenOnboarding);

  const { isPremium, purchasePremium, restorePurchases, resetPremium } = usePurchase();

  const handleToggleColorScheme = useCallback(() => {
    const next = colorScheme === 'dark' ? 'light' : 'dark';
    setColorScheme(next);
    AsyncStorage.setItem(COLOR_SCHEME_KEY, next);
  }, [colorScheme, setColorScheme]);

  const handleToggleHaptics = useCallback(() => {
    const next = !hapticsEnabled;
    setHapticsEnabled(next);
    AsyncStorage.setItem(HAPTICS_KEY, String(next));
  }, [hapticsEnabled, setHapticsEnabled]);

  const handleShowIntro = useCallback(() => {
    AsyncStorage.removeItem('@whohere/hasSeenOnboarding');
    setHasSeenOnboarding(false);
    router.push({ pathname: '/onboarding', params: { from: 'settings' } });
  }, [setHasSeenOnboarding]);

  return (
    <ScreenLayout>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.grid}>
          {isPremium ? (
            <>
              <View style={[styles.row, { borderColor: colors.accent + '30' }]}>
                <View style={styles.rowText}>
                  <Text style={[styles.rowLabel, { color: colors.accent }]}>PREMIUM</Text>
                  <Text style={[styles.rowSublabel, { color: colors.textMuted }]}>Alla kort på hand</Text>
                </View>
                <Text style={{ color: colors.accent + '80', fontSize: 12 }}>✦</Text>
              </View>
              {__DEV__ && (
                <AnimatedRow onPress={resetPremium}>
                  {() => (
                    <View style={styles.rowText}>
                      <Text style={styles.rowLabel}>DEV: RESET PREMIUM</Text>
                      <Text style={styles.rowSublabel}>Lås premium igen</Text>
                    </View>
                  )}
                </AnimatedRow>
              )}
            </>
          ) : (
            <AnimatedRow onPress={purchasePremium}>
              {() => (
                <View style={styles.rowText}>
                  <Text style={styles.rowLabel}>LÅS UPP ALLT</Text>
                  <Text style={styles.rowSublabel}>Engångskostnad — 69 kr</Text>
                </View>
              )}
            </AnimatedRow>
          )}

          <AnimatedRow onPress={restorePurchases}>
            {() => (
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>ÅTERSTÄLL KÖP</Text>
                <Text style={styles.rowSublabel}>Återställ ett tidigare köp</Text>
              </View>
            )}
          </AnimatedRow>

          <AnimatedRow
            onPress={handleToggleColorScheme}
            right={<TogglePill active={colorScheme === 'dark'} />}
          >
            {() => (
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>UTSEENDE</Text>
                <Text style={styles.rowSublabel}>Dark mode</Text>
              </View>
            )}
          </AnimatedRow>

          <AnimatedRow
            onPress={handleToggleHaptics}
            right={<TogglePill active={hapticsEnabled} />}
          >
            {() => (
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>HAPTIK</Text>
                <Text style={styles.rowSublabel}>Vibrera när du byter kort</Text>
              </View>
            )}
          </AnimatedRow>

          <AnimatedRow
            onPress={handleShowIntro}
            right={<Chevron />}
          >
            {() => (
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>INTRO</Text>
                <Text style={styles.rowSublabel}>Visa igen</Text>
              </View>
            )}
          </AnimatedRow>
        </View>

        <View style={styles.infoBlock}>
          <Text style={styles.infoText}>
            Tankar, idéer eller något som inte fungerar?{'\n'}
            <Text style={styles.infoLink} onPress={() => Linking.openURL('mailto:hello@whohere.app?subject=Feedback')}>hello@whohere.app</Text>
          </Text>
          <Text style={styles.infoText}>
            Buggar och tekniska problem:{'\n'}
            <Text style={styles.infoLink} onPress={() => Linking.openURL('mailto:bugs@whohere.app?subject=Bug report')}>bugs@whohere.app</Text>
          </Text>

          <Text style={styles.version}>v1.0.0</Text>
        </View>

      </ScrollView>
      <LinearGradient
        colors={[colors.bgPrimary + '00', colors.bgPrimary + 'EE', colors.bgPrimary]}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: TAB_BAR_BOTTOM_CLEARANCE + 100, pointerEvents: 'none' }}
      />
    </ScreenLayout>
  );
}
