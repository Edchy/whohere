import { useRouter } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '../../src/constants/theme';
import { useGameStore } from '../../src/store/gameStore';
import { Deck } from '../../src/types';
import decksData from '../../assets/data/decks.json';

const allDecks = decksData as Deck[];

export default function DecksScreen() {
  const router = useRouter();
  const startGame = useGameStore((s) => s.startGame);

  const handleDeckPress = (deck: Deck) => {
    startGame(deck, deck.mode);
    router.push(`/play/${deck.id}`);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>All decks</Text>
        <Text style={styles.subtitle}>{allDecks.length} packs available</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {allDecks.map((deck) => (
          <TouchableOpacity
            key={deck.id}
            style={styles.row}
            onPress={() => handleDeckPress(deck)}
            activeOpacity={0.6}
          >
            <View style={[styles.dot, { backgroundColor: deck.color }]} />
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>{deck.title}</Text>
              <Text style={styles.rowDesc}>{deck.description}</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={[styles.rowCount, { color: deck.color }]}>{deck.cardCount}</Text>
              <Text style={styles.rowCountLabel}>cards</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 32,
    fontWeight: '300',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  scroll: {
    paddingBottom: spacing.xxxl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  rowDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  rowRight: {
    alignItems: 'flex-end',
  },
  rowCount: {
    fontSize: 22,
    fontWeight: '300',
    letterSpacing: -0.5,
  },
  rowCountLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
