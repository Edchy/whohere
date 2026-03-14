import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing, typography } from "../../src/constants/theme";
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

const MODE_COLORS: Record<string, string> = {
  partner: colors.datingTint,
  group: colors.friendsTint,
  solo: colors.soloTint,
};

function buildDeck(selectedIds: string[], modeId: string): Deck {
  const color = MODE_COLORS[modeId] ?? colors.accent;
  const rawCards: Card[] = selectedIds.flatMap((deckId) => {
    const source = allDecks.find((d) => d.id === deckId);
    if (!source) return [];
    return source.cards.map((card) => ({
      ...card,
      deckIcon: source.icon,
      deckTitle: source.title,
      deckColor: source.color,
      deckBackground: source.cardBackground,
      deckText: source.cardText,
    }));
  });
  const filtered = rawCards.filter((card) => passesIntensityFilter(card, modeId));
  const cards = filtered.length > 0 ? filtered : rawCards;
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
    router.push(`/play/${deck.id}`);
  };

  const modeColor = MODE_COLORS[mode ?? ""] ?? colors.accent;
  const modeLabel = MODE_LABELS[mode ?? ""] ?? "Play";

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.modeLabel}>{modeLabel}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>Välj dina kortlekar</Text>
        <Text style={styles.subtitle}>
          Mixa fritt — kort från alla valda lekar blandas ihop.
        </Text>
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
                <Text style={[styles.icon, { color: deck.color }]}>{deck.icon}</Text>
                <View style={styles.rowText}>
                  <View style={styles.titleRow}>
                    <Text style={styles.rowTitle}>{deck.title}</Text>
                    {isDefault && (
                      <Text style={[styles.badge, { color: modeColor, borderColor: modeColor + "60" }]}>
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
            { backgroundColor: modeColor },
            !canStart && styles.startBtnDisabled,
          ]}
          onPress={handleStart}
          activeOpacity={0.8}
          disabled={!canStart}
        >
          <Text style={styles.startBtnText}>
            {randomize && selected.length === 0
              ? "Starta — slumpmässigt"
              : `Starta — ${selected.reduce((n, id) => n + (allDecks.find((d) => d.id === id)?.cards.length ?? 0), 0)} kort`}
          </Text>
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
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  back: {
    fontSize: 22,
    color: colors.textMuted,
    fontWeight: "300",
  },
  modeLabel: {
    ...typography.label,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: "300",
    color: colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: "italic",
    lineHeight: 18,
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
    fontSize: 22,
    width: 32,
    textAlign: "center",
    color: colors.accent,
  },
  randomTitle: {
    ...typography.bodyMedium,
    color: colors.accent,
    marginBottom: 2,
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
    fontSize: 22,
    width: 32,
    textAlign: "center",
  },
  rowText: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: 2,
  },
  rowTitle: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  badge: {
    fontSize: 10,
    fontWeight: "500",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  rowDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: "italic",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.md,
  },
  checkmark: {
    color: "#fff",
    fontSize: 12,
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
    height: 52,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  startBtnDisabled: {
    opacity: 0.3,
  },
  startBtnText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
    letterSpacing: 0.3,
  },
});
