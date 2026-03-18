import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import ScreenLayout from '../../src/components/ScreenLayout';
import { DeckTile } from '../../src/components/DeckTile';
import { spacing } from '../../src/constants/theme';
import { useGameStore } from '../../src/store/gameStore';
import allDecks from '../../assets/data/decks/index';

export default function DecksScreen() {
  const router = useRouter();
  const startGame = useGameStore((s) => s.startGame);

  return (
    <ScreenLayout>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {allDecks.map((deck) => (
          <DeckTile
            key={deck.id}
            deck={deck}
            isSelected
            onPress={() => {
              startGame(deck, deck.mode);
              router.push(`/play/${deck.id}`);
            }}
          />
        ))}
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.sm,
  },
});
