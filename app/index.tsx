import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ModeSelector } from '../src/components/ModeSelector';
import { DeckCard } from '../src/components/DeckCard';
import { colors, spacing, typography } from '../src/constants/theme';
import { useGameStore } from '../src/store/gameStore';
import { Deck, DeckMode } from '../src/types';
import decksData from '../assets/data/decks.json';

const allDecks = decksData as Deck[];

export default function HomeScreen() {
  const router = useRouter();
  const startGame = useGameStore((s) => s.startGame);
  const [selectedMode, setSelectedMode] = useState<DeckMode | null>(null);

  const filteredDecks = selectedMode
    ? allDecks.filter((d) => d.mode === selectedMode || d.mode === 'any')
    : allDecks;

  const handleDeckPress = (deck: Deck) => {
    startGame(deck, selectedMode ?? 'any');
    router.push(`/play/${deck.id}`);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.wordmark}>whohere</Text>
          <Text style={styles.tagline}>Question cards for real conversations.</Text>
        </View>

        {/* Mode Picker */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>WHO'S PLAYING?</Text>
          <ModeSelector selected={selectedMode} onSelect={setSelectedMode} />
          {selectedMode && (
            <TouchableOpacity onPress={() => setSelectedMode(null)}>
              <Text style={styles.clearFilter}>Show all decks</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Decks */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PICK A DECK</Text>
          {filteredDecks.map((deck) => (
            <DeckCard key={deck.id} deck={deck} onPress={() => handleDeckPress(deck)} />
          ))}
        </View>
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
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  wordmark: {
    ...typography.displayLarge,
    color: colors.accent,
    marginBottom: spacing.xs,
  },
  tagline: {
    ...typography.body,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  clearFilter: {
    ...typography.caption,
    color: colors.accent,
    marginTop: spacing.sm,
  },
});
