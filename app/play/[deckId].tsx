import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { useState } from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '../../src/constants/theme';
import { useHaptics } from '../../src/hooks/useHaptics';
import { useGameStore } from '../../src/store/gameStore';
import { Deck } from '../../src/types';
import decksData from '../../assets/data/decks.json';

const allDecks = decksData as Deck[];
const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;
const CARD_HEIGHT = 380;

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

  // Swipe animation
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (!activeDeck && deckId) {
      const deck = allDecks.find((d) => d.id === deckId);
      if (deck) startGame(deck, deck.mode);
    }
  }, [deckId]);

  // Reset card position whenever the card changes
  useEffect(() => {
    translateX.value = 0;
    opacity.value = withTiming(1, { duration: 200 });
  }, [currentIndex]);

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

  const swipeLeft = () => {
    opacity.value = withTiming(0, { duration: 150 });
    translateX.value = withTiming(-SCREEN_WIDTH, { duration: 250 }, () => {
      runOnJS(handleNext)();
    });
  };

  const swipeRight = () => {
    if (currentIndex === 0) {
      translateX.value = withSpring(0);
      return;
    }
    opacity.value = withTiming(0, { duration: 150 });
    translateX.value = withTiming(SCREEN_WIDTH, { duration: 250 }, () => {
      runOnJS(handlePrev)();
    });
  };

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (e.translationX < -SWIPE_THRESHOLD) {
        runOnJS(swipeLeft)();
      } else if (e.translationX > SWIPE_THRESHOLD && currentIndex > 0) {
        runOnJS(swipeRight)();
      } else {
        translateX.value = withSpring(0, { damping: 20 });
      }
    });

  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotate: `${(translateX.value / SCREEN_WIDTH) * 6}deg` },
    ],
    opacity: opacity.value,
  }));

  if (!card || !activeDeck) return null;

  const deckColor = activeDeck.color;
  const cardNum = currentIndex + 1;
  const total = activeDeck.cards.length;

  if (discretion) {
    return (
      <Pressable style={styles.discretionScreen} onPress={toggleDiscretion}>
        <Text style={styles.discretionHint}>tap to continue</Text>
      </Pressable>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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

        {/* Card area */}
        <View style={styles.cardArea}>
          {/* Shadow card behind for depth */}
          <View style={[styles.cardShadow, { borderColor: deckColor + '30' }]} />

          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.card, { borderColor: deckColor + '60' }, cardAnimStyle]}>
              {/* Mode indicator */}
              <View style={styles.modeRow}>
                <Text style={[styles.modeIndicator, { color: deckColor }]}>
                  {activeDeck.icon}  {activeDeck.title.toUpperCase()}
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

              {/* Footer: difficulty + swipe hint */}
              <View style={styles.cardFooter}>
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
                <Text style={styles.swipeHint}>swipe →</Text>
              </View>
            </Animated.View>
          </GestureDetector>
        </View>

        {/* Bottom bar */}
        <View style={styles.nav}>
          <TouchableOpacity onPress={toggleDiscretion} style={styles.discretionBtn} hitSlop={8}>
            <Text style={styles.discretionIcon}>👁</Text>
          </TouchableOpacity>

          {isLast && (
            <TouchableOpacity
              onPress={handleNext}
              style={[styles.finishBtn, { borderColor: deckColor }]}
            >
              <Text style={[styles.finishBtnText, { color: deckColor }]}>finish</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
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
    alignItems: 'center',
  },
  // Static card peeking behind for depth effect
  cardShadow: {
    position: 'absolute',
    width: '92%',
    height: CARD_HEIGHT,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    top: 12,
  },
  card: {
    width: '100%',
    height: CARD_HEIGHT,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    padding: spacing.xl,
    justifyContent: 'space-between',
  },
  modeRow: {},
  modeIndicator: {
    ...typography.label,
    letterSpacing: 1.5,
  },
  questionBlock: {
    flex: 1,
    justifyContent: 'center',
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
    fontSize: 28,
    fontWeight: '300',
    color: colors.textPrimary,
    lineHeight: 40,
    letterSpacing: 0.1,
  },
  followUpBlock: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    marginBottom: spacing.sm,
  },
  followUpLabel: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
  followUp: {
    ...typography.body,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  swipeHint: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
    letterSpacing: 0.5,
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
  finishBtn: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
  },
  finishBtnText: {
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
