import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { DeckIcon } from "../../src/components/DeckIcon";
import ScreenLayout from "../../src/components/ScreenLayout";
import { animation, colors, fonts, radius, spacing, typography } from "../../src/constants/theme";
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

function buildDeck(selectedIds: string[], modeId: string): Deck {
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

// ─── Animated tile ────────────────────────────────────────────────────────────

function DeckTile({
  deck,
  isSelected,
  isDefault,
  onPress,
}: {
  deck: (typeof allDecks)[0];
  isSelected: boolean;
  isDefault: boolean;
  onPress: () => void;
}) {
  const opacity = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.timing(opacity, { toValue: 0.75, duration: animation.press, useNativeDriver: true }).start();

  const onPressOut = () =>
    Animated.timing(opacity, { toValue: 1, duration: animation.base, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ opacity }}>
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
        style={[
          styles.tile,
          isSelected && { backgroundColor: deck.cardBackground },
        ]}
      >
        <View style={styles.tileInner}>
          <DeckIcon
            deck={deck}
            size={36}
            color={isSelected ? deck.cardText : colors.textPrimary}
          />
          <View style={styles.tileText}>
            <View style={styles.tileTitleRow}>
              <Text style={[styles.tileTitle, isSelected && { color: deck.cardText }]}>
                {deck.title}
              </Text>
              {isDefault && !isSelected && (
                <Text style={styles.badge}>förslag</Text>
              )}
            </View>
            <Text style={[styles.tileDesc, isSelected && { color: deck.cardText + "99" }]}>
              {deck.description}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function CategoriesScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode: string }>();
  const startGame = useGameStore((s) => s.startGame);

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
    const deck = buildDeck(ids, mode ?? "partner");
    startGame(deck, "any");
    router.replace(`/play/${deck.id}`);
  };

  const startOpacity = useRef(new Animated.Value(1)).current;
  const onStartPressIn = () =>
    Animated.timing(startOpacity, { toValue: 0.75, duration: animation.press, useNativeDriver: true }).start();
  const onStartPressOut = () =>
    Animated.timing(startOpacity, { toValue: 1, duration: animation.base, useNativeDriver: true }).start();

  return (
    <ScreenLayout mainStyle={styles.layoutMain}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Vad vill du utforska?</Text>
          <Text style={styles.subtitle}>Välj en kortlek — eller låt slumpen bestämma.</Text>
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
              style={[styles.tile, randomize && { backgroundColor: colors.accent }]}
            >
              <View style={styles.tileInner}>
                <Text style={[styles.surpriseIcon, randomize && { color: colors.textOnBrand }]}>⚄</Text>
                <View style={styles.tileText}>
                  <Text style={[styles.tileTitle, randomize && styles.tileTitleSelected]}>
                    Överraska mig
                  </Text>
                  <Text style={[styles.tileDesc, randomize && styles.tileDescSelected]}>
                    En slumpmässig mix av kortlekar
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
              isDefault={defaults.includes(deck.id)}
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
            <Text style={styles.startLabel}>Spela →</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  layoutMain: {
    paddingTop: 0,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.sm,
  },
  header: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  title: {
    fontFamily: fonts.heading,
    ...typography.heading,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: "italic",
  },
  tileList: {
    gap: spacing.sm,
  },
  tile: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.bgSecondary,
  },
  tileSelected: {
    backgroundColor: colors.accent,
  },
  tileInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  surpriseIcon: {
    ...typography.body,
    color: colors.textPrimary,
  },
  tileText: {
    flex: 1,
    gap: spacing.xs,
  },
  tileTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  tileTitle: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  tileTitleSelected: {
    color: colors.textOnBrand,
  },
  tileDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: "italic",
  },
  tileDescSelected: {
    color: colors.textOnBrandMuted,
  },
  badge: {
    ...typography.label,
    textTransform: "uppercase",
    color: colors.textMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
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
  startLabel: {
    fontFamily: fonts.heading,
    ...typography.body,
    color: colors.textOnBrand,
    letterSpacing: 0.5,
  },
});
