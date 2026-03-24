import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef } from 'react';
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
      paddingTop: spacing.xl,
      paddingBottom: spacing.xl,
      gap: 0,
    },
    infoBlockLight: {},
    appHeader: {
      gap: 2,
      marginBottom: 0,
    },
    appName: {
      fontFamily: 'AuthorBold',
      fontSize: 28,
      lineHeight: 30,
      textTransform: 'uppercase',
      color: colors.textPrimary,
      
    },
    subtitle: {
      fontFamily: 'AuthorExtralight',
      fontSize: 20,
      lineHeight: 22,
      color: colors.textSecondary,
      textTransform: 'uppercase'
    },
    infoText: {
      fontFamily: 'AuthorRegular',
      fontSize: 14,
      lineHeight: 22,
      color: colors.textSecondary,
    },
    infoEmphasis: {
      fontFamily: 'AuthorExtralight',
      fontSize: 14,
      lineHeight: 22,
      color: colors.textPrimary,
    },
    infoLink: {
      fontFamily: 'AuthorExtralight',
      fontSize: 14,
      lineHeight: 22,
      color: colors.textPrimary,
      textDecorationLine: 'underline',
    },
    quoteBlock: {
      paddingVertical: spacing.md,
      gap: spacing.xs,
    },
    quoteText: {
      fontFamily: 'AuthorExtralight',
      fontSize: 18,
      lineHeight: 26,
      fontStyle: 'italic',
      color: colors.textPrimary,
    },
    quoteAttribution: {
      fontFamily: 'AuthorRegular',
      fontSize: 11,
      lineHeight: 16,
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      color: colors.textMuted,
    },
    infoItalic: {
      fontFamily: 'AuthorExtralight',
      fontSize: 14,
      lineHeight: 22,
      fontStyle: 'italic',
      color: colors.textSecondary,
    },
    infoMeta: {
      gap: spacing.md,
      marginTop: spacing.lg,
    },
    feedbackSection: {
      marginTop: spacing.lg,
      gap: 0,
    },
    feedbackRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
    },
    feedbackRowArrow: {
      fontFamily: 'AuthorRegular',
      fontSize: 16,
      color: colors.accent,
    },
    version: {
      fontFamily: 'AuthorRegular',
      fontSize: 14,
      color: colors.textMuted,
      marginTop: spacing.xl,
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

function Quote({ text, attribution }: { text: string; attribution: string }) {
  const colors = useColors();
  const styles = makeStyles(colors);
  return (
    <View style={styles.quoteBlock}>
      <Text style={styles.quoteText}>"{text}"</Text>
      <Text style={styles.quoteAttribution}>{attribution}</Text>
    </View>
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

        <View style={styles.infoBlock}>
          <View style={styles.appHeader}>
            <Text style={styles.appName}>Vem här ... ?</Text>
            <Text style={styles.subtitle}>Intuitiva mikrohistorier om människorna omkring dig.</Text>
          </View>

          <View style={styles.infoMeta}>
         

          

            <Quote
              text="We don't see things as they are, we see them as we are."
              attribution="Anaïs Nin"
            />

            <Text style={styles.infoText}>
              Det här spelet är en resa i fem steg:{' '}
              <Text style={styles.infoEmphasis}>observation, projektion, jämförelse, reflektion, uppenbarelse.</Text>
              {' '}Du tittar. Du väljer. Du förklarar varför. Och i det ögonblicket händer något oväntat.
            </Text>

            <Quote
              text="We make snap judgments in the blink of an eye — and we pay a steep price for that snap judgment when it's wrong."
              attribution="Malcolm Gladwell, Blink"
            />

            <Text style={styles.infoText}>
              Det börjar med <Text style={styles.infoEmphasis}>bekräftelsebias</Text>
              {', '}vi hittar precis det vi letade efter. Sedan <Text style={styles.infoEmphasis}>haloeffekten</Text>
              {': '}snygga skor och plötsligt verkar hen också vara rolig på fester. Lite <Text style={styles.infoEmphasis}>stereotypisering</Text>
              {', '}en jacka, en ålder, en hel livshistoria. Och till sist, det finaste: <Text style={styles.infoEmphasis}>projektion</Text>
              {'. '}Personen du valde säger förmodligen mer om dig än om dem.
            </Text>

            <Quote
              text="Everything that irritates us about others can lead us to an understanding of ourselves."
              attribution="Carl Jung"
            />

            <Text style={styles.infoItalic}>
              Den okände sitter still. Det är du som rör på dig, inuti. Den du väljer är ett bläckplack. En tillfällig människa som råkade bära din historia en stund.
            </Text>

            <Text style={styles.infoText}>
              Efter idé av{' '}
              <Text style={styles.infoLink} onPress={() => Linking.openURL('https://rubenwatte.com')}>Ruben Wätte.</Text>
              {' '}Utvecklad och designad i samarbete med{' '}
              <Text style={styles.infoLink} onPress={() => Linking.openURL('https://nope.digital')}>Nope Digital.</Text>
            </Text>
          </View>

          <View style={styles.feedbackSection}>
            <Pressable
              style={styles.feedbackRow}
              onPress={() => Linking.openURL('mailto:hello@whohere.app?subject=Feedback')}
            >
              <Text style={[styles.infoText, { flex: 1 }]}>Skicka feedback</Text>
              <Text style={styles.feedbackRowArrow}>→</Text>
            </Pressable>

            <Pressable
              style={styles.feedbackRow}
              onPress={() => Linking.openURL('mailto:hello@whohere.app?subject=Bug report')}
            >
              <Text style={[styles.infoText, { flex: 1 }]}>Rapportera ett problem</Text>
              <Text style={styles.feedbackRowArrow}>→</Text>
            </Pressable>
          </View>

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
