import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";

import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing, typography } from "../../src/constants/theme";
import { useHaptics } from "../../src/hooks/useHaptics";
import { useGameStore } from "../../src/store/gameStore";
import { Card, Deck } from "../../src/types";
import decksData from "../../assets/data/decks.json";

const allDecks = decksData as Deck[];
const CARD_HEIGHT = 400;
const SWIPE_DISTANCE = 60;
const SWIPE_VELOCITY = 400;

// Next card resting state offsets (peeks behind top card)
const NEXT_TRANSLATE_Y = 20;
const NEXT_SCALE = 0.94;
const NEXT_OPACITY = 0.65;

function CardFace({
  card,
  deck,
}: {
  card: Card;
  deck: Deck;
}) {
  return (
    <>
      <View style={styles.modeRow}>
        <Text style={[styles.modeIndicator, { color: deck.color }]}>
          {deck.icon}{"  "}{deck.title.toUpperCase()}
        </Text>
      </View>
      <View style={styles.questionBlock}>
        <Text style={styles.whoHere}>Who here…</Text>
        <Text style={styles.question}>{card.question}</Text>
      </View>
      {card.followUp && (
        <View style={styles.followUpBlock}>
          <Text style={styles.followUpLabel}>then ask —</Text>
          <Text style={styles.followUp}>{card.followUp}</Text>
        </View>
      )}
      <View style={styles.cardFooter}>
        <View style={styles.difficultyRow}>
          {[1, 2, 3].map((d) => (
            <View
              key={d}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    d <= card.difficulty ? deck.color : colors.border,
                },
              ]}
            />
          ))}
        </View>
      </View>
    </>
  );
}

export default function PlayScreen() {
  const router = useRouter();
  const { deckId } = useLocalSearchParams<{ deckId: string }>();
  const haptics = useHaptics();
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const [discretion, setDiscretion] = useState(false);

  const activeDeck = useGameStore((s) => s.activeDeck);
  const startGame = useGameStore((s) => s.startGame);
  const storeIndex = useGameStore((s) => s.currentCardIndex);
  const nextCardStore = useGameStore((s) => s.nextCard);
  const prevCardStore = useGameStore((s) => s.prevCard);
  const endGame = useGameStore((s) => s.endGame);

  const [topIndex, setTopIndex] = useState(0);
  const animating = useSharedValue(false);

  // dragX: translation of the top card being dragged
  const dragX = useSharedValue(0);
  // nextProgress: 0 = next card at resting offset, 1 = fully in place
  const nextProgress = useSharedValue(0);

  useEffect(() => {
    if (!activeDeck && deckId) {
      const deck = allDecks.find((d) => d.id === deckId);
      if (deck) {
        startGame(deck, deck.mode);
        setTopIndex(0);
      }
    }
  }, [deckId]);

  useEffect(() => {
    if (!animating.value) {
      setTopIndex(storeIndex);
    }
  }, [storeIndex]);

  const commitNext = useCallback(() => {
    nextCardStore();
    setTopIndex((i) => i + 1);
    dragX.value = 0;
    nextProgress.value = 0;
    animating.value = false;
  }, [nextCardStore]);

  const commitPrev = useCallback(() => {
    prevCardStore();
    setTopIndex((i) => i - 1);
    dragX.value = 0;
    nextProgress.value = 0;
    animating.value = false;
  }, [prevCardStore]);

  const commitFinish = useCallback(() => {
    endGame();
    router.replace("/play/results");
  }, [endGame, router]);

  // Top card slides/rotates with drag
  const topCardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: dragX.value },
      { rotate: `${(dragX.value / SCREEN_WIDTH) * 7}deg` },
    ],
  }));

  // Next card rises up as the top card is dragged left
  const nextCardStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          nextProgress.value,
          [0, 1],
          [NEXT_TRANSLATE_Y, 0]
        ),
      },
      {
        scale: interpolate(nextProgress.value, [0, 1], [NEXT_SCALE, 1]),
      },
    ],
    opacity: interpolate(nextProgress.value, [0, 1], [NEXT_OPACITY, 1]),
  }));

  const deck = activeDeck;

  // Shared values so gesture callbacks can read them on the UI thread
  const topIndexSV = useSharedValue(topIndex);
  const cardCountSV = useSharedValue(deck?.cards.length ?? 0);

  useEffect(() => {
    topIndexSV.value = topIndex;
  }, [topIndex]);

  useEffect(() => {
    cardCountSV.value = deck?.cards.length ?? 0;
  }, [deck]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      const idx = topIndexSV.value;
      const cardCount = cardCountSV.value;
      const isFirst = idx === 0;
      const isLast = idx === cardCount - 1;

      if (isFirst && e.translationX > 0) {
        // Rubber-band at first card going right
        dragX.value = e.translationX * 0.08;
        nextProgress.value = 0;
      } else if (isLast && e.translationX < 0) {
        // Allow swiping last card away (to results)
        dragX.value = e.translationX;
        nextProgress.value = 0; // no next card
      } else {
        dragX.value = e.translationX;
        // Drive next card up proportionally as we drag left
        if (e.translationX < 0) {
          nextProgress.value = Math.min(
            1,
            -e.translationX / (SCREEN_WIDTH * 0.55)
          );
        } else {
          nextProgress.value = 0;
        }
      }
    })
    .onEnd((e) => {
      const idx = topIndexSV.value;
      const cardCount = cardCountSV.value;
      const isLast = idx === cardCount - 1;
      const dist = e.translationX;
      const vel = e.velocityX;
      const goLeft = dist < -SWIPE_DISTANCE || vel < -SWIPE_VELOCITY;
      const goRight =
        (dist > SWIPE_DISTANCE || vel > SWIPE_VELOCITY) && idx > 0;

      if (goLeft) {
        animating.value = true;
        // Snap next card to full size in parallel as top flies out
        nextProgress.value = withSpring(1, { damping: 18, stiffness: 220 });
        dragX.value = withTiming(
          -SCREEN_WIDTH * 1.5,
          { duration: 240 },
          () => {
            if (isLast) {
              commitFinish();
            } else {
              commitNext();
            }
          }
        );
      } else if (goRight) {
        animating.value = true;
        nextProgress.value = withSpring(0, { damping: 22, stiffness: 220 });
        dragX.value = withTiming(
          SCREEN_WIDTH * 1.5,
          { duration: 240 },
          () => {
            commitPrev();
          }
        );
      } else {
        // Snap back — bouncy spring
        dragX.value = withSpring(0, { damping: 20, stiffness: 300 });
        nextProgress.value = withSpring(0, { damping: 20, stiffness: 300 });
      }
    });

  const handleClose = () => {
    endGame();
    router.back();
  };
  const toggleDiscretion = () => {
    haptics.medium();
    setDiscretion((v) => !v);
  };

  if (discretion) {
    return (
      <Pressable style={styles.discretionScreen} onPress={toggleDiscretion}>
        <Text style={styles.discretionHint}>tap to continue</Text>
      </Pressable>
    );
  }

  if (!deck) return null;

  const topCard: Card | undefined = deck.cards[topIndex];
  const nextCardData: Card | undefined = deck.cards[topIndex + 1];
  const isLast = topIndex === deck.cards.length - 1;
  const progress = (topIndex + 1) / deck.cards.length;

  if (!topCard) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleClose} hitSlop={12}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.deckTitle}>{deck.title}</Text>
          <Text style={styles.cardCount}>
            {topIndex + 1} / {deck.cards.length}
          </Text>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress * 100}%`, backgroundColor: deck.color },
            ]}
          />
        </View>

        <View style={styles.cardArea}>
          {/* Next card — behind the top card, rises up as top is dragged */}
          {nextCardData && (
            <Animated.View
              style={[
                styles.card,
                {
                  borderColor: deck.color + "40",
                  backgroundColor: colors.surface,
                },
                nextCardStyle,
              ]}
            >
              <CardFace card={nextCardData} deck={deck} />
            </Animated.View>
          )}

          {/* Top card — responds to pan gesture */}
          <GestureDetector gesture={panGesture}>
            <Animated.View
              style={[
                styles.card,
                { borderColor: deck.color + "70" },
                topCardStyle,
              ]}
            >
              <CardFace card={topCard} deck={deck} />
              <View style={styles.swipeHintRow}>
                <Text style={styles.swipeHint}>swipe →</Text>
              </View>
            </Animated.View>
          </GestureDetector>
        </View>

        <View style={styles.nav}>
          <TouchableOpacity
            onPress={toggleDiscretion}
            style={styles.discretionBtn}
            hitSlop={8}
          >
            <Text style={styles.discretionIcon}>👁</Text>
          </TouchableOpacity>

          {isLast && (
            <TouchableOpacity
              onPress={() => {
                haptics.light();
                commitFinish();
              }}
              style={[styles.finishBtn, { borderColor: deck.color }]}
            >
              <Text style={[styles.finishBtnText, { color: deck.color }]}>
                finish
              </Text>
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
    paddingHorizontal: spacing.md,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  closeText: { fontSize: 16, color: colors.textMuted },
  deckTitle: {
    ...typography.label,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  cardCount: { ...typography.caption, color: colors.textMuted },
  progressTrack: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.xl,
    marginHorizontal: spacing.sm,
  },
  progressFill: { height: 1 },
  cardArea: {
    flex: 1,
    justifyContent: "center",
  },
  card: {
    position: "absolute",
    width: "100%",
    height: CARD_HEIGHT,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    padding: spacing.xl,
    justifyContent: "space-between",
  },
  modeRow: {},
  modeIndicator: { ...typography.label, letterSpacing: 1.5 },
  questionBlock: { flex: 1, justifyContent: "center" },
  whoHere: {
    fontSize: 17,
    fontStyle: "italic",
    color: colors.accent,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    fontWeight: "300",
  },
  question: {
    fontSize: 28,
    fontWeight: "300",
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
    fontStyle: "italic",
    letterSpacing: 0.5,
  },
  followUp: {
    ...typography.body,
    color: colors.textSecondary,
    fontStyle: "italic",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  difficultyRow: { flexDirection: "row", gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  swipeHintRow: {
    position: "absolute",
    bottom: spacing.xl,
    right: spacing.xl,
  },
  swipeHint: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: "italic",
    letterSpacing: 0.5,
  },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.sm,
    gap: spacing.md,
  },
  discretionBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  discretionIcon: { fontSize: 18 },
  finishBtn: {
    flex: 1,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
  },
  finishBtnText: { ...typography.bodyMedium, letterSpacing: 0.5 },
  discretionScreen: {
    flex: 1,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 60,
  },
  discretionHint: {
    ...typography.caption,
    color: "#222222",
    letterSpacing: 1,
  },
});
