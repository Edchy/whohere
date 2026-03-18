import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import RandomSvg from "../../assets/icons/noun-doodle-element-7389160.svg";
import { DeckTile } from "../../src/components/DeckTile";
import ScreenLayout from "../../src/components/ScreenLayout";
import { animation, AppColors, fonts, radius, spacing, typography } from "../../src/constants/theme";
import { useColors } from "../../src/hooks/useColors";

import { useGameStore } from "../../src/store/gameStore";
import { Card, Deck, IntensityAxis } from "../../src/types";
import allDecks from "../../assets/data/decks/index";

// Which decks are pre-selected per mode
const DEFAULT_SELECTIONS: Record<string, string[]> = {
  partner: ["relationer-kanslor", "personlighet"],
  group: ["livssituationer", "personlighet"],
  solo: ["liv-bakgrund", "relationer-kanslor"],
};

// Intensity range [min, max] per axis per mode.
// Cards with a non-zero value outside the range are excluded.
// Cards with value 0 on an axis always pass (0 = "not applicable").
type AxisRange = [min: number, max: number];
type ModeRanges = Partial<Record<IntensityAxis, AxisRange>>;

const MODE_INTENSITY_RANGES: Record<string, ModeRanges> = {
  partner: {
    bold: [1, 4], daring: [1, 4], sexual: [0, 3],
    vulnerable: [1, 4], controversial: [0, 2], dark: [0, 2], funny: [0, 4],
  },
  group: {
    bold: [1, 5], daring: [1, 5], sexual: [0, 1],
    vulnerable: [0, 2], controversial: [0, 3], dark: [0, 2], funny: [1, 5],
  },
  solo: {
    bold: [0, 3], daring: [0, 3], sexual: [0, 0],
    vulnerable: [2, 5], controversial: [1, 4], dark: [1, 4], funny: [0, 2],
  },
};

function passesIntensityFilter(card: Card, modeId: string): boolean {
  const ranges = MODE_INTENSITY_RANGES[modeId];
  if (!ranges) return true;
  for (const axis of Object.keys(ranges) as IntensityAxis[]) {
    const range = ranges[axis];
    if (!range) continue;
    const val = card.intensity?.[axis] ?? 0;
    if (val === 0) continue;
    const [min, max] = range;
    if (val < min || val > max) return false;
  }
  return true;
}

const MODE_LABELS: Record<string, string> = {
  partner: "På date",
  group: "Med vänner",
  solo: "På egen hand",
};

const GAME_CARD_LIMIT = 15;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(selectedIds: string[], modeId: string, colors: AppColors): Deck {
  const color = colors.accent;

  const deckCount = selectedIds.length;
  const basePerDeck = Math.floor(GAME_CARD_LIMIT / deckCount);
  const remainder = GAME_CARD_LIMIT % deckCount;

  const cards: Card[] = shuffle(
    selectedIds.flatMap((deckId, i) => {
      const source = allDecks.find((d) => d.id === deckId);
      if (!source) return [];
      const quota = basePerDeck + (i < remainder ? 1 : 0);
      const stamped = source.cards.map((card) => ({
        ...card,
        deckIcon: source.icon,
        deckSvgIcon: source.svgIcon,
        deckTitle: source.title,
        deckColor: source.color,
        deckBackground: source.cardBackground,
        deckText: source.cardText,
      }));
      const filtered = stamped.filter((card) => passesIntensityFilter(card, modeId));
      const pool = filtered.length > 0 ? filtered : stamped;
      return shuffle(pool).slice(0, quota);
    })
  );

  return {
    id: `curated-${modeId}`,
    title: MODE_LABELS[modeId] ?? "Spela",
    description: "",
    mode: "any",
    category: "mixed",
    color,
    cardBackground: colors.card,
    cardText: colors.textPrimary,
    icon: "",
    cards,
  };
}

function randomSubset(ids: string[]): string[] {
  const count = 1 + Math.floor(Math.random() * ids.length);
  const shuffled = [...ids].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// ─── Header copy ──────────────────────────────────────────────────────────────

const HEADER_TITLES: Record<string, string[]> = {
  partner: [
    "Vad vill ni lära er om varandra?",
    "Vart vill ni ta samtalet ikväll?",
    "Vad är ni redo att utforska?",
  ],
  group: [
    "Vad ska ni blanda er i ikväll?",
    "Vart tar ni gruppen?",
    "Vad väljer ni att gå in i?",
  ],
  solo: [
    "Vad vill du möta idag?",
    "Vart tar du dig själv?",
    "Vad är du redo att titta på?",
  ],
};

const HEADER_SUBTITLES: Record<string, string[]> = {
  partner: [
    "Välj vad som lockar er — eller låt oss välja.",
    "Plocka det ni vill dyka in i. Eller kasta tärningen.",
    "Era val. Eller slumpens.",
  ],
  group: [
    "Välj vad gruppen orkar med. Eller låt ödet avgöra.",
    "Plocka ihop ert kvällsprogram — eller överlåt det åt slumpen.",
    "Alla väljer, ingen bestämmer — eller låt oss sköta det.",
  ],
  solo: [
    "Välj vad du vill brottas med. Eller låt slumpen ta rodret.",
    "Dina val — eller överlåt dem till universum.",
    "Plocka det du vill gå in i. Eller låt det komma till dig.",
  ],
};

function pickHeaderTitle(mode: string): string {
  const options = HEADER_TITLES[mode] ?? HEADER_TITLES["partner"];
  return options[Math.floor(Math.random() * options.length)];
}

function pickHeaderSubtitle(mode: string): string {
  const options = HEADER_SUBTITLES[mode] ?? HEADER_SUBTITLES["partner"];
  return options[Math.floor(Math.random() * options.length)];
}

// ─── Surprise tile descriptions ───────────────────────────────────────────────

const SURPRISE_DESCS: Record<string, string[]> = {
  partner: [
    "Ett handplockat urval för er två. Men med ett uns överraskning.",
    "Kurerat för er. Ordningen är slumpens fel.",
    "Rätt frågor för er två, i fel ordning. Med flit.",
  ],
  group: [
    "Utvalda för gruppen. Men ingen vet vad som kommer härnäst.",
    "Kurerat kaos för alla inblandade.",
    "Rätt kortlekar för er. Fel ordning. Med avsikt.",
  ],
  solo: [
    "Handplockat för dig. Ordningen bestämmer sig själv.",
    "Kurerat för en. Överraskningarna ingår.",
    "Rätt frågor för dig, i en ordning bara slumpen känner till.",
  ],
};

function pickSurpriseDesc(mode: string): string {
  const options = SURPRISE_DESCS[mode] ?? SURPRISE_DESCS["partner"];
  return options[Math.floor(Math.random() * options.length)];
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    scroll: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.xxxl,
      gap: spacing.sm,
    },
    header: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xl,
      borderRadius: radius.md,
      borderColor: colors.border,
      backgroundColor: colors.bgSecondary,
      gap: spacing.xs,
    },
    title: {
      ...typography.display,
      fontFamily: fonts.heading,
      color: colors.textPrimary,
      textTransform: 'uppercase',
      lineHeight: 24,
    },
    subtitle: {
      ...typography.caption,
      fontFamily: fonts.copy,
      color: colors.textMuted,
    },
    tileList: {
      gap: spacing.sm,
    },
    surpriseTile: {
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.md,
      backgroundColor: colors.bgSecondary,
    },
    surpriseInner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    surpriseText: {
      flex: 1,
      gap: spacing.xs,
    },
    surpriseTitle: {
      ...typography.bodyMedium,
      fontFamily: fonts.heading,
      fontSize: 24,
      textTransform: 'uppercase',
    },
    surpriseDesc: {
      ...typography.caption,
      fontFamily: fonts.copy,
    },
    startWrap: {
      marginTop: spacing.md,
    },
    startBtn: {
      height: 52,
      borderRadius: radius.md,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    startBtnDisabled: {
      opacity: 0.3,
    },
  });
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function CategoriesScreen() {
  const colors = useColors();
  const colorScheme = useGameStore((s) => s.colorScheme);
  const styles = makeStyles(colors);

  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode: string }>();
  const startGame = useGameStore((s) => s.startGame);
  const surpriseDesc = useRef(pickSurpriseDesc(mode ?? "partner")).current;
  const headerTitle = useRef(pickHeaderTitle(mode ?? "partner")).current;
  const headerSubtitle = useRef(pickHeaderSubtitle(mode ?? "partner")).current;

  const defaults = DEFAULT_SELECTIONS[mode ?? ""] ?? [];
  const [selected, setSelected] = useState<string[]>([]);
  const [randomize, setRandomize] = useState(true);

  const surpriseOpacity = useRef(new Animated.Value(1)).current;

  const toggle = (id: string) => {
    setRandomize(false);
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSurpriseToggle = () => {
    setRandomize(true);
    setSelected([]);
  };

  const canStart = randomize || selected.length > 0;

  const handleStart = () => {
    if (!canStart) return;
    const modePool = DEFAULT_SELECTIONS[mode ?? ""] ?? allDecks.map((d) => d.id);
    const ids = randomize ? randomSubset(modePool) : selected;
    const deck = buildDeck(ids, mode ?? "partner", colors);
    startGame(deck, "any");
    router.replace(`/play/${deck.id}`);
  };

  const startOpacity = useRef(new Animated.Value(1)).current;
  const onStartPressIn = () =>
    Animated.timing(startOpacity, { toValue: 0.75, duration: animation.press, useNativeDriver: true }).start();
  const onStartPressOut = () =>
    Animated.timing(startOpacity, { toValue: 1, duration: animation.base, useNativeDriver: true }).start();

  return (
    <ScreenLayout>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{headerTitle}</Text>
          <Text style={styles.subtitle}>{headerSubtitle}</Text>
        </View>

        <View style={styles.tileList}>
          {/* Surprise tile */}
          <Animated.View style={{ opacity: surpriseOpacity }}>
            <Pressable
              onPressIn={() =>
                Animated.timing(surpriseOpacity, { toValue: 0.75, duration: animation.press, useNativeDriver: true }).start()
              }
              onPressOut={() =>
                Animated.timing(surpriseOpacity, { toValue: 1, duration: animation.base, useNativeDriver: true }).start()
              }
              onPress={handleSurpriseToggle}
              style={[styles.surpriseTile, randomize && { backgroundColor: colors.accent }]}
            >
              <View style={styles.surpriseInner}>
                <RandomSvg width={36} height={36} fill={randomize ? (colorScheme === 'light' ? '#111111' : colors.bgPrimary) : colors.textPrimary} />
                <View style={styles.surpriseText}>
                  <Text style={[styles.surpriseTitle, { color: randomize ? (colorScheme === 'light' ? '#111111' : colors.bgPrimary) : colors.textPrimary }]}>
                    Överraska mig!
                  </Text>
                  <Text style={[styles.surpriseDesc, { color: randomize ? (colorScheme === 'light' ? '#44444499' : colors.bgPrimary + '99') : colors.textMuted }]}>
                    {surpriseDesc}
                  </Text>
                </View>
              </View>
            </Pressable>
          </Animated.View>

          {/* Deck tiles */}
          {allDecks.map((deck) => (
            <DeckTile
              key={deck.id}
              deck={deck}
              isSelected={selected.includes(deck.id)}
              badge={defaults.includes(deck.id) && !selected.includes(deck.id) ? 'förslag' : undefined}
              showCount={false}
              onPress={() => toggle(deck.id)}
            />
          ))}
        </View>

        {/* Start button */}
        <Animated.View style={[styles.startWrap, { opacity: startOpacity }]}>
          <Pressable
            onPressIn={onStartPressIn}
            onPressOut={onStartPressOut}
            onPress={handleStart}
            disabled={!canStart}
            style={[styles.startBtn, !canStart && styles.startBtnDisabled]}
          >
            <Ionicons name="play" size={22} color={colors.textOnBrand} />
          </Pressable>
        </Animated.View>
      </ScrollView>
    </ScreenLayout>
  );
}
