import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '../../src/constants/theme';
import { useHaptics } from '../../src/hooks/useHaptics';
import { useGameStore } from '../../src/store/gameStore';
import { Deck } from '../../src/types';
import decksData from '../../assets/data/decks.json';

const allDecks = decksData as Deck[];

export default function PlayScreen() {
  const router = useRouter();
  const { deckId } = useLocalSearchParams<{ deckId: string }>();
  const haptics = useHaptics();
  const [discretion, setDiscretion] = useState(false);

  const activeDeck = useGameStore((s) => s.activeDeck);
  const startGame = useGameStore((s) => s.startGame);
  const card = useGameStore((s) => s.currentCard());
  const isLast = useGameStore((s) => s.isLastCard());
  const progress = useGameStore((s) => s.progress());
  const currentIndex = useGameStore((s) => s.currentCardIndex);
  const nextCard = useGameStore((s) => s.nextCard);
  const prevCard = useGameStore((s) => s.prevCard);
  const endGame = useGameStore((s) => s.endGame);

  // Auto-start if navigated directly (e.g. from home screen mode tap)
  useEffect(() => {
    if (!activeDeck && deckId) {
      const deck = allDecks.find((d) => d.id === deckId);
      if (deck) startGame(deck, deck.mode);
    }
  }, [deckId]);

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

  const toggleDiscretion = () => {
    haptics.medium();
    setDiscretion((v) => !v);
  };

  if (!card || !activeDeck) return null;

  const deckColor = activeDeck.color;
  const cardNum = currentIndex + 1;
  const total = activeDeck.cards.length;

  // Discretion overlay — instant black screen
  if (discretion) {
    return (
      <Pressable style={styles.discretionScreen} onPress={toggleDiscretion}>
        <Text style={styles.discretionHint}>tap to continue</Text>
      </Pressable>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleClose} hitSlop={12}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.deckTitle}>{activeDeck.title}</Text>
        <Text style={styles.cardCount}>{cardNum} / {total}</Text>
      </View>

      {/* Progress */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${progress * 100}%`, backgroundColor: deckColor },
          ]}
        />
      </View>

      {/* Card */}
      <View style={styles.cardArea}>
        <View style={styles.card}>
          {/* Mode indicator */}
          <View style={styles.modeRow}>
            <Text style={[styles.modeIndicator, { color: deckColor }]}>
              {activeDeck.icon} {activeDeck.title.toLowerCase()}
            </Text>
          </View>

          {/* Question */}
          <View style={styles.questionBlock}>
            <Text style={styles.whoHere}>Who here…</Text>
            <Text style={styles.question}>{card.question}</Text>
          </View>

          {/* Follow-up */}
          {card.followUp && (
            <View style={styles.followUpBlock}>
              <Text style={styles.followUpLabel}>then ask —</Text>
              <Text style={styles.followUp}>{card.followUp}</Text>
            </View>
          )}

          {/* Difficulty */}
          <View style={styles.difficultyRow}>
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

      {/* Bottom nav */}
      <View style={styles.nav}>
        {/* Discretion button */}
        <TouchableOpacity onPress={toggleDiscretion} style={styles.discretionBtn} hitSlop={8}>
          <Text style={styles.discretionIcon}>👁</Text>
        </TouchableOpacity>

        <View style={styles.navButtons}>
          <TouchableOpacity
            onPress={handlePrev}
            disabled={currentIndex === 0}
            style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]}
          >
            <Text style={styles.navBtnText}>←</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNext}
            style={[styles.navBtnPrimary, { borderColor: deckColor }]}
          >
            <Text style={[styles.navBtnPrimaryText, { color: deckColor }]}>
              {isLast ? 'finish' : 'next →'}
            </Text>
          </TouchableOpacity>
        </View>
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
  closeText: {
    fontSize: 16,
    color: colors.textMuted,
  },
  deckTitle: {
    ...typography.label,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  cardCount: {
    ...typography.caption,
    color: colors.textMuted,
  },
  progressTrack: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.xl,
  },
  progressFill: {
    height: 1,
  },
  cardArea: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  modeRow: {
    marginBottom: spacing.xl,
  },
  modeIndicator: {
    ...typography.label,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  questionBlock: {
    marginBottom: spacing.xl,
  },
  whoHere: {
    fontSize: 17,
    fontStyle: 'italic',
    color: colors.accent,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    fontWeight: '300',
  },
  question: {
    fontSize: 30,
    fontWeight: '300',
    color: colors.textPrimary,
    lineHeight: 42,
    letterSpacing: 0.1,
  },
  followUpBlock: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    marginBottom: spacing.lg,
  },
  followUpLabel: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    textTransform: 'lowercase',
    letterSpacing: 0.5,
    fontStyle: 'italic',
  },
  followUp: {
    ...typography.body,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  discretionBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  discretionIcon: {
    fontSize: 18,
  },
  navButtons: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  navBtn: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  navBtnDisabled: {
    opacity: 0.2,
  },
  navBtnText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  navBtnPrimary: {
    flex: 1,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
  },
  navBtnPrimaryText: {
    ...typography.bodyMedium,
    letterSpacing: 0.5,
  },

  // Discretion mode
  discretionScreen: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 60,
  },
  discretionHint: {
    ...typography.caption,
    color: '#222222',
    letterSpacing: 1,
  },
});
