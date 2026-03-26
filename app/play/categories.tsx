import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import PlayArrowSvg from "../../assets/icons/noun-arrow-8300346.svg";
import RandomSvg from "../../assets/icons/category-icons/noun-doodle-197625.svg";
import { DeckTile } from "../../src/components/DeckTile";
import ModalLayout from "../../src/components/ModalLayout";
import { animation, AppColors, radius, spacing, TAB_BAR_BOTTOM_CLEARANCE, typography } from "../../src/constants/theme";
import { useColors } from "../../src/hooks/useColors";

import { useGameStore } from "../../src/store/gameStore";
import { usePurchase } from "../../src/hooks/usePurchase";
import { Card, Deck } from "../../src/types";
import allDecks from "../../assets/data/decks/index";


const MODE_LABELS: Record<string, string> = {
  partner: "På date",
  group: "Med vänner",
  solo: "På egen hand",
};

const GAME_CARD_LIMIT = 30;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(selectedIds: string[], modeId: string): Deck {
  if (selectedIds.length === 0) {
    return {
      id: `curated-${modeId}`,
      title: MODE_LABELS[modeId] ?? "Spela",
      description: "",
      mode: [modeId as any],
      category: "mixed",
      icon: "",
      cards: [],
    };
  }

  const cardLimit = GAME_CARD_LIMIT;
  const deckCount = selectedIds.length;
  const basePerDeck = Math.floor(cardLimit / deckCount);
  const remainder = cardLimit % deckCount;

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
      }));
      return shuffle(stamped).slice(0, quota);
    })
  );

  return {
    id: `curated-${modeId}`,
    title: MODE_LABELS[modeId] ?? "Spela",
    description: "",
    mode: [modeId as any],
    category: "mixed",
    icon: "",
    cards,
  };
}

// ─── Header copy ──────────────────────────────────────────────────────────────

const HEADER_TITLES: Record<string, string> = {
  partner: "Vilka lager av liv vill ni utforska tillsammans?",
  group:   "Välj kategorier själva, eller låt slumpen avgöra?",
  solo:    "Vad säger din magkänsla om andra, egentligen?",
};

const HEADER_SUBTITLES: Record<string, string> = {
  partner: "Låt nyfikenheten visa vägen in i ert undermedvetna",
  group:   "Svara ärligt och spontant på frågorna som dyker upp",
  solo:    "Människokännedom och självkännedom är livskunskap",
};

const SURPRISE_DESC = "Vi blandar ihop allt och låter slumpen styra";

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    scroll: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: TAB_BAR_BOTTOM_CLEARANCE + spacing.xl,
      gap: spacing.lg,
    },
    header: {
      paddingTop: spacing.md,
      paddingBottom: spacing.xs,
      gap: spacing.sm,
    },
    title: {
      ...typography.display,
      fontSize: 26,
      lineHeight: 34,
      color: colors.textPrimary,
    },
    subtitle: {
      ...typography.body,
      color: colors.textMuted,
    },
    tileList: {
      gap: spacing.md,
    },
    surpriseTile: {
      paddingVertical: spacing.xl,
      paddingHorizontal: spacing.md,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.bgSecondary,
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
      ...typography.heading,
      fontSize: 20,
      lineHeight: 26,
    },
    surpriseDesc: {
      ...typography.caption,
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.xs,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerLabel: {
      ...typography.badge,
      color: colors.textMuted,
    },
    startBtn: {
      width: 64,
      height: 64,
      borderRadius: 32,
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
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode: string }>();
  const startGame = useGameStore((s) => s.startGame);
  const { isPremium, purchasePremium } = usePurchase();
  const headerTitle = HEADER_TITLES[mode ?? "partner"] ?? HEADER_TITLES["partner"];
  const headerSubtitle = HEADER_SUBTITLES[mode ?? "partner"] ?? HEADER_SUBTITLES["partner"];

  const modeDecks = allDecks.filter((d) => d.mode.includes(mode as any));
  const [selected, setSelected] = useState<string[]>([]);
  const [randomize, setRandomize] = useState(true);

  const toggle = useCallback((id: string) => {
    if (!isPremium && !allDecks.find((d) => d.id === id)?.free) {
      purchasePremium();
      return;
    }
    setRandomize(false);
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, [isPremium, purchasePremium]);

  const handleSurpriseToggle = useCallback(() => {
    setRandomize(true);
    setSelected([]);
  }, []);

  const canStart = randomize || selected.length > 0;

  const handleStart = () => {
    if (!canStart) return;
    const eligibleDecks = isPremium ? modeDecks : modeDecks.filter((d) => d.free);
    const ids = randomize ? eligibleDecks.map((d) => d.id) : selected;
    const deck = buildDeck(ids, mode ?? "partner");
    startGame(deck, (mode ?? "partner") as any);
    router.replace(`/play/${deck.id}`);
  };

  const surpriseTileOpacity = useRef(new Animated.Value(1)).current;
  const onSurprisePressIn = useCallback(() =>
    Animated.timing(surpriseTileOpacity, { toValue: 0.75, duration: animation.press, useNativeDriver: true }).start(), []);
  const onSurprisePressOut = useCallback(() =>
    Animated.timing(surpriseTileOpacity, { toValue: 1, duration: animation.base, useNativeDriver: true }).start(), []);

  const startOpacity = useRef(new Animated.Value(1)).current;
  const onStartPressIn = useCallback(() =>
    Animated.timing(startOpacity, { toValue: 0.75, duration: animation.press, useNativeDriver: true }).start(), []);
  const onStartPressOut = useCallback(() =>
    Animated.timing(startOpacity, { toValue: 1, duration: animation.base, useNativeDriver: true }).start(), []);

  return (
    <ModalLayout>
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
          <Animated.View style={{ opacity: surpriseTileOpacity }}>
            <Pressable
              onPressIn={onSurprisePressIn}
              onPressOut={onSurprisePressOut}
              onPress={handleSurpriseToggle}
              style={[styles.surpriseTile, randomize && { backgroundColor: colors.accent, borderColor: 'transparent' }]}
            >
              <View style={styles.surpriseInner}>
                <View style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}>
                  <RandomSvg width={32} height={32} fill={randomize ? colors.textOnBrand : colors.textPrimary} />
                </View>
                <View style={styles.surpriseText}>
                  <Text style={[styles.surpriseTitle, { color: randomize ? colors.textOnBrand : colors.textPrimary }]}>
                    ÖVERRASKA MIG!
                  </Text>
                  <Text style={[styles.surpriseDesc, { color: randomize ? colors.textOnBrand + '99' : colors.textMuted }]}>
                    {SURPRISE_DESC}
                  </Text>
                </View>
              </View>
            </Pressable>
          </Animated.View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerLabel}>ELLER VÄLJ SJÄLV</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Deck tiles */}
          {allDecks.map((deck) => (
            <DeckTile
              key={deck.id}
              deck={deck}
              isSelected={selected.includes(deck.id)}
              showCount={false}
              locked={!isPremium && !deck.free}
              onPress={() => toggle(deck.id)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Fade gradient behind floating button */}
      <LinearGradient
        colors={[colors.bgPrimary + '00', colors.bgPrimary + 'EE', colors.bgPrimary]}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 240, pointerEvents: 'none' }}
      />

      {/* Floating start button */}
      <Animated.View style={[{ position: 'absolute', bottom: spacing.xl, alignSelf: 'center' }, { opacity: startOpacity }]}>
        <Pressable
          onPressIn={onStartPressIn}
          onPressOut={onStartPressOut}
          onPress={handleStart}
          disabled={!canStart}
          style={[styles.startBtn, !canStart && styles.startBtnDisabled]}
        >
          <PlayArrowSvg width={20} height={20} fill={colors.textOnBrand} />
        </Pressable>
      </Animated.View>
    </ModalLayout>
  );
}
