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
import allDecks from '../../assets/data/decks/index';
import AppHeader from '../../src/components/AppHeader';

export default function DecksScreen() {
  const router = useRouter();
  const startGame = useGameStore((s) => s.startGame);

  const handleDeckPress = (deck: Deck) => {
    startGame(deck, deck.mode);
    router.push(`/play/${deck.id}`);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Kortlekar</Text>
          <Text style={styles.subtitle}>Välj en kategori och börja spela</Text>
        </View>
        {allDecks.map((deck) => (
          <TouchableOpacity
            key={deck.id}
            style={styles.row}
            onPress={() => handleDeckPress(deck)}
            activeOpacity={0.6}
          >
            <View style={[styles.iconBox, { borderColor: deck.color + '40' }]}>
              <Text style={[styles.icon, { color: deck.color }]}>{deck.icon}</Text>
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>{deck.title}</Text>
              <Text style={styles.rowDesc}>{deck.description}</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={[styles.rowCount, { color: deck.color }]}>{deck.cards.length}</Text>
              <Text style={styles.rowCountLabel}>kort</Text>
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
  sectionHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
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
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  icon: {
    fontSize: 20,
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
