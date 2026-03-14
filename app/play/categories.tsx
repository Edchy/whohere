import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { DeckIcon } from "../../src/components/DeckIcon";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, dimensions, fonts, radius, spacing, typography } from "../../src/constants/theme";
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
    if (val === 0) continue; // 0 = not applicable, always passes
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

  // Distribute GAME_CARD_LIMIT evenly across selected decks
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
    cardText: colors.textPrimary,  // curated deck fallback — text on neutral card bg
    icon: "",
    cards,
  };
}

function randomSubset(ids: string[]): string[] {
  const count = 1 + Math.floor(Math.random() * ids.length);
  const shuffled = [...ids].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default function CategoriesScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode: string }>();
  const startGame = useGameStore((s) => s.startGame);

  const defaults = DEFAULT_SELECTIONS[mode ?? ""] ?? [];
  const [selected, setSelected] = useState<string[]>([]);
  const [randomize, setRandomize] = useState(true);

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
    const ids = randomize
      ? randomSubset(modePool)
      : selected;
    const deck = buildDeck(ids, mode ?? "partner");
    startGame(deck, "any");
    router.replace(`/play/${deck.id}`);
  };


  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Vad vill du utforska?</Text>
        <Text style={styles.subtitle}>Välj en eller flera kortlekar — vi blandar ihop resten.</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Randomize option */}
        <TouchableOpacity
          style={[styles.randomRow, randomize && { borderLeftColor: colors.accent }]}
          onPress={handleSurpriseToggle}
          activeOpacity={0.7}
        >
          <Text style={styles.randomIcon}>⚄</Text>
          <View style={styles.rowText}>
            <Text style={styles.randomTitle}>Överraska mig</Text>
            <Text style={styles.rowDesc}>Välj en slumpmässig mix av kortlekar</Text>
          </View>
          <View style={[styles.checkbox, randomize && { backgroundColor: colors.accent, borderColor: colors.accent }]}>
            {randomize && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </TouchableOpacity>

        {allDecks.map((deck) => {
          const isSelected = selected.includes(deck.id);
          const isDefault = defaults.includes(deck.id);
          return (
            <TouchableOpacity
              key={deck.id}
              style={[styles.row, isSelected && { borderColor: deck.color + "80" }]}
              onPress={() => toggle(deck.id)}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <DeckIcon deck={deck} size={22} style={styles.icon} />
                <View style={styles.rowText}>
                  <View style={styles.titleRow}>
                    <Text style={styles.rowTitle}>{deck.title}</Text>
                    {isDefault && (
                      <Text style={[styles.badge, { color: colors.accent, borderColor: colors.accent + "60" }]}>
                        förslag
                      </Text>
                    )}
                  </View>
                  <Text style={styles.rowDesc}>{deck.description}</Text>
                </View>
              </View>
              <View style={[styles.checkbox, isSelected && { backgroundColor: deck.color, borderColor: deck.color }]}>
                {isSelected && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.startBtn,
            { backgroundColor: colors.accent },
            !canStart && styles.startBtnDisabled,
          ]}
          onPress={handleStart}
          activeOpacity={0.8}
          disabled={!canStart}
        >
          <Ionicons name="play" size={spacing.lg} color={colors.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontFamily: fonts.heading,
    ...typography.heading,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: "italic",
  },
  scroll: {
    paddingVertical: spacing.sm,
    paddingBottom: spacing.xxxl,
  },
  randomRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  randomIcon: {
    ...typography.body,
    width: dimensions.iconContainer,
    textAlign: "center",
    color: colors.accent,
  },
  randomTitle: {
    ...typography.bodyMedium,
    color: colors.accent,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    borderLeftWidth: 3,
    borderLeftColor: "transparent",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
  },
  icon: {
    ...typography.body,
    width: dimensions.iconContainer,
    textAlign: "center",
  },
  rowText: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  rowTitle: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  badge: {
    ...typography.label,
    textTransform: "uppercase",
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
  },
  rowDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: "italic",
  },
  checkbox: {
    width: dimensions.checkboxSize,
    height: dimensions.checkboxSize,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.md,
  },
  checkmark: {
    color: colors.white,
    ...typography.caption,
    fontWeight: "600",
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  startBtn: {
    height: dimensions.buttonHeight,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  startBtnDisabled: {
    opacity: 0.3,
  },
});
