import { useRouter } from 'expo-router';
import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ProgressBar } from '../../src/components/ProgressBar';
import { colors, radius, spacing, typography } from '../../src/constants/theme';
import { useHaptics } from '../../src/hooks/useHaptics';
import { useGameStore } from '../../src/store/gameStore';

export default function PlayScreen() {
  const router = useRouter();
  const haptics = useHaptics();

  const card = useGameStore((s) => s.currentCard());
  const isLast = useGameStore((s) => s.isLastCard());
  const progress = useGameStore((s) => s.progress());
  const activeDeck = useGameStore((s) => s.activeDeck);
  const currentIndex = useGameStore((s) => s.currentCardIndex);
  const nextCard = useGameStore((s) => s.nextCard);
  const prevCard = useGameStore((s) => s.prevCard);
  const endGame = useGameStore((s) => s.endGame);

  const handleNext = () => {
    haptics.light();
    if (isLast) {
      endGame();
      router.replace('/play/results');
    } else {
      nextCard();
    }
  };

  const handlePrev = () => {
    haptics.light();
    prevCard();
  };

  const handleClose = () => {
    endGame();
    router.back();
  };

  if (!card || !activeDeck) return null;

  const deckColor = activeDeck.color;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.deckTitle}>{activeDeck.title}</Text>
        <Text style={styles.cardCount}>
          {currentIndex + 1} / {activeDeck.cards.length}
        </Text>
      </View>

      <ProgressBar progress={progress} color={deckColor} />

      {/* Card */}
      <View style={styles.cardArea}>
        <View style={[styles.card, { borderColor: deckColor + '44' }]}>
          <Text style={styles.deckIcon}>{activeDeck.icon}</Text>
          <Text style={styles.question}>{card.question}</Text>
          {card.followUp && (
            <View style={styles.followUpBox}>
              <Text style={styles.followUpLabel}>Follow up</Text>
              <Text style={styles.followUp}>{card.followUp}</Text>
            </View>
          )}
          {/* Difficulty dots */}
          <View style={styles.difficulty}>
            {[1, 2, 3].map((d) => (
              <View
                key={d}
                style={[
                  styles.dot,
                  { backgroundColor: d <= card.difficulty ? deckColor : colors.border },
                ]}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Nav */}
      <View style={styles.nav}>
        <TouchableOpacity
          onPress={handlePrev}
          disabled={currentIndex === 0}
          style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
        >
          <Text style={styles.navButtonText}>← Prev</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleNext}
          style={[styles.navButtonPrimary, { backgroundColor: deckColor }]}
        >
          <Text style={styles.navButtonPrimaryText}>{isLast ? 'Finish 🎉' : 'Next →'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    ...typography.body,
    color: colors.textMuted,
  },
  deckTitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  cardCount: {
    ...typography.caption,
    color: colors.textMuted,
  },
  cardArea: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.xl,
    alignItems: 'center',
  },
  deckIcon: {
    fontSize: 40,
    marginBottom: spacing.lg,
  },
  question: {
    ...typography.heading,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  followUpBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    width: '100%',
    marginBottom: spacing.lg,
  },
  followUpLabel: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  followUp: {
    ...typography.body,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  difficulty: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  nav: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  navButton: {
    flex: 1,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  navButtonPrimary: {
    flex: 2,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  navButtonPrimaryText: {
    ...typography.bodyMedium,
    color: '#000',
  },
});
