import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import ScreenLayout from '../../src/components/ScreenLayout';
import { DeckTile } from '../../src/components/DeckTile';
import { spacing, TAB_BAR_BOTTOM_CLEARANCE } from '../../src/constants/theme';
import { useColors } from '../../src/hooks/useColors';
import { usePurchase } from '../../src/hooks/usePurchase';
import allDecks from '../../assets/data/decks/index';

export default function DecksScreen() {
  const router = useRouter();
  const colors = useColors();
  const { isPremium } = usePurchase();

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
            locked={!isPremium && !deck.free}
            showCount={false}
            onPress={() => router.push(`/decks/${deck.id}`)}
          />
        ))}
      </ScrollView>
      <LinearGradient
        colors={[colors.bgPrimary + '00', colors.bgPrimary + 'EE', colors.bgPrimary]}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: TAB_BAR_BOTTOM_CLEARANCE, pointerEvents: 'none' }}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: TAB_BAR_BOTTOM_CLEARANCE,
    gap: spacing.sm,
  },
});
