import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, typography, radius } from "../../src/constants/theme";
import { useGameStore } from "../../src/store/gameStore";
import { Card, Deck } from "../../src/types";
import decksData from "../../assets/data/decks.json";

const allDecks = decksData as Deck[];

function getDeckById(id: string): Deck | undefined {
  return allDecks.find((d) => d.id === id);
}

// Build a merged virtual deck from cards across multiple source decks
function buildCuratedDeck(
  id: string,
  title: string,
  color: string,
  icon: string,
  deckIds: string[],
): Deck {
  const cards: Card[] = deckIds.flatMap((deckId) => {
    const source = getDeckById(deckId);
    if (!source) return [];
    return source.cards.map((card) => ({
      ...card,
      deckIcon: source.icon,
      deckTitle: source.title,
      deckColor: source.color,
    }));
  });
  return {
    id,
    title,
    description: "",
    mode: "any",
    category: "fun",
    cardCount: cards.length,
    color,
    icon,
    cards,
  };
}

const MODES = [
  {
    id: "partner",
    label: "On a date",
    sublabel: "Flirty. Curious. Revealing.",
    emoji: "💕",
    color: colors.datingTint,
    // Spicy + Secret Agent
    deckIds: ["spicy", "secret-agent"],
    curatedId: "curated-date",
    curatedTitle: "On a date",
    curatedIcon: "💕",
  },
  {
    id: "group",
    label: "With friends",
    sublabel: "Absurd. Funny. A little chaotic.",
    emoji: "👯",
    color: colors.friendsTint,
    // Dark Backgrounds + Secret Agent
    deckIds: ["dark-backgrounds", "secret-agent"],
    curatedId: "curated-friends",
    curatedTitle: "With friends",
    curatedIcon: "👯",
  },
  {
    id: "solo",
    label: "Alone",
    sublabel: "Slow. Observant. Meditative.",
    emoji: "🧍",
    color: colors.soloTint,
    // Meditative + Spicy
    deckIds: ["meditative", "spicy"],
    curatedId: "curated-alone",
    curatedTitle: "Alone",
    curatedIcon: "🧍",
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const startGame = useGameStore((s) => s.startGame);

  const handleModePress = (mode: (typeof MODES)[0]) => {
    const deck = buildCuratedDeck(
      mode.curatedId,
      mode.curatedTitle,
      mode.color,
      mode.curatedIcon,
      mode.deckIds,
    );
    startGame(deck, "any");
    router.push(`/play/${mode.curatedId}`);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.wordmark}>Who here?</Text>
          <Text style={styles.tagline}>A game about how we read people.</Text>
        </View>

        <View style={styles.modes}>
          {MODES.map((mode, i) => (
            <TouchableOpacity
              key={mode.id}
              style={[
                styles.modeCard,
                i < MODES.length - 1 && styles.modeCardBorder,
              ]}
              onPress={() => handleModePress(mode)}
              activeOpacity={0.6}
            >
              <View style={styles.modeLeft}>
                <Text style={styles.modeEmoji}>{mode.emoji}</Text>
                <View>
                  <Text style={styles.modeLabel}>{mode.label}</Text>
                  <Text style={styles.modeSublabel}>{mode.sublabel}</Text>
                </View>
              </View>
              <Text style={[styles.modeArrow, { color: mode.color }]}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.hint}>Look around. Pick someone. Discuss why.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    flexGrow: 1,
    justifyContent: "center",
  },
  header: {
    marginBottom: spacing.xxxl,
    marginTop: spacing.xl,
  },
  wordmark: {
    fontSize: 44,
    fontWeight: "300",
    color: colors.accent,
    letterSpacing: -1,
    lineHeight: 52,
    marginBottom: spacing.sm,
  },
  tagline: {
    ...typography.body,
    color: colors.textSecondary,
    fontStyle: "italic",
  },
  modes: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: "hidden",
    marginBottom: spacing.xl,
  },
  modeCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.card,
  },
  modeCardBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  modeEmoji: {
    fontSize: 28,
    width: 40,
  },
  modeLabel: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    marginBottom: 2,
    fontSize: 17,
  },
  modeSublabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: "italic",
  },
  modeArrow: {
    fontSize: 20,
    fontWeight: "300",
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
    fontStyle: "italic",
    letterSpacing: 0.3,
  },
});
