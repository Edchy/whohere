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
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { runOnJS } from "react-native-worklets";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing, typography } from "../../src/constants/theme";
import AppHeader from "../../src/components/AppHeader";
import { useHaptics } from "../../src/hooks/useHaptics";
import { useGameStore } from "../../src/store/gameStore";
import { Card, Deck } from "../../src/types";
import allDecks from "../../assets/data/decks/index";

const CARD_HEIGHT = 400;
const SWIPE_DISTANCE = 60;
const SWIPE_VELOCITY = 400;

// Next card resting state offsets (peeks behind top card)
const NEXT_TRANSLATE_Y = 20;
const NEXT_SCALE = 0.94;

// Flip animation config
const FLIP_TOGGLE_CONFIG = { duration: 160, easing: Easing.inOut(Easing.ease) };

function CardFace({ card, deck, cardIndex, totalCards }: { card: Card; deck: Deck; cardIndex: number; totalCards: number }) {
  const icon = card.deckIcon ?? deck.icon;
  const title = card.deckTitle ?? deck.title;
  const color = card.deckColor ?? deck.color;
  const cardText = card.deckText ?? deck.cardText;

  return (
    <>
      <View style={styles.modeRow}>
        <Text style={[styles.modeIndicator, { color }]}>
          {icon}
          {"  "}
          {title.toUpperCase()}
        </Text>
      </View>
      <View style={styles.questionBlock}>
        <Text style={[styles.whoHere, { color }]}>Vem här…</Text>
        <Text style={[styles.question, { color: cardText }]}>{card.question}</Text>
      </View>
      {card.followUp && (
        <View style={[styles.followUpBlock, { borderTopColor: `${cardText}22` }]}>
          <Text style={[styles.followUpLabel, { color: `${cardText}66` }]}>följdfråga —</Text>
          <Text style={[styles.followUp, { color: `${cardText}99` }]}>{card.followUp}</Text>
        </View>
      )}
      <View style={styles.cardFooter}>
        <Text style={[styles.cardCounter, { color: `${cardText}55` }]}>{cardIndex + 1} / {totalCards}</Text>
      </View>
    </>
  );
}

function CardBack({ deck }: { deck: Deck }) {
  return (
    <View style={styles.cardBackContent}>
      <Text style={styles.cardBackIcon}>{deck.icon}</Text>
      <Text style={[styles.cardBackTitle, { color: deck.color }]}>
        {deck.title.toUpperCase()}
      </Text>
      <Text style={styles.cardBackHint}>tryck för att vända</Text>
    </View>
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
  const swipedRef = React.useRef(false);
  const markSwiping = React.useCallback(() => { swipedRef.current = true; }, []);
  const clearSwiping = React.useCallback(() => { swipedRef.current = false; }, []);

  const dragX = useSharedValue(0);
  const nextProgress = useSharedValue(0);
  const prevProgress = useSharedValue(0);

  // Flip state: 0 = front face visible, 1 = back face visible
  const flipProgress = useSharedValue(0);

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

  // Reset flip to front instantly whenever the top card changes
  useEffect(() => {
    flipProgress.value = 0;
  }, [topIndex]);

  const commitNext = useCallback(() => {
    nextCardStore();
    setTopIndex((i) => i + 1);
    // Reset instantly — top card already off screen, next card was at progress=1
    dragX.value = 0;
    nextProgress.value = 0;
    prevProgress.value = 0;
    animating.value = false;
  }, [nextCardStore]);

  const commitPrev = useCallback(() => {
    prevCardStore();
    setTopIndex((i) => i - 1);
    // Reset instantly — top card already off screen, prev card was at progress=1
    dragX.value = 0;
    nextProgress.value = 0;
    prevProgress.value = 0;
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

  const nextCardStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          nextProgress.value,
          [0, 1],
          [NEXT_TRANSLATE_Y, 0],
        ),
      },
      { scale: interpolate(nextProgress.value, [0, 1], [NEXT_SCALE, 1]) },
    ],
    opacity: interpolate(nextProgress.value, [0, 0.15, 1], [0, 1, 1]),
  }));

  const prevCardStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          prevProgress.value,
          [0, 1],
          [NEXT_TRANSLATE_Y, 0],
        ),
      },
      { scale: interpolate(prevProgress.value, [0, 1], [NEXT_SCALE, 1]) },
    ],
    opacity: interpolate(prevProgress.value, [0, 0.15, 1], [0, 1, 1]),
  }));

  // Two-face counter-rotation: front 0→180, back -180→0.
  // backfaceVisibility hides each face once it rotates past 90deg.
  // Low perspective (600) exaggerates depth for a convincing 3D feel.
  const frontFaceStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 600 },
      { rotateY: `${interpolate(flipProgress.value, [0, 1], [0, 180])}deg` },
    ],
  }));

  const backFaceStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 600 },
      { rotateY: `${interpolate(flipProgress.value, [0, 1], [-180, 0])}deg` },
    ],
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
    .onBegin(() => {
      runOnJS(clearSwiping)();
    })
    .onUpdate((e) => {
      const idx = topIndexSV.value;
      const cardCount = cardCountSV.value;
      const isFirst = idx === 0;
      const isLast = idx === cardCount - 1;

      runOnJS(markSwiping)();

      if (isFirst && e.translationX > 0) {
        // Rubber-band at first card — nowhere to go back
        dragX.value = e.translationX * 0.08;
        nextProgress.value = 0;
        prevProgress.value = 0;
      } else if (isLast && e.translationX < 0) {
        // Last card swiping left to results — no next card behind it
        dragX.value = e.translationX;
        nextProgress.value = 0;
        prevProgress.value = 0;
      } else if (e.translationX < 0) {
        // Dragging left — reveal next card
        dragX.value = e.translationX;
        nextProgress.value = Math.min(
          1,
          -e.translationX / (SCREEN_WIDTH * 0.55),
        );
        prevProgress.value = 0;
      } else {
        // Dragging right — reveal previous card
        dragX.value = e.translationX;
        nextProgress.value = 0;
        prevProgress.value = Math.min(
          1,
          e.translationX / (SCREEN_WIDTH * 0.55),
        );
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
        runOnJS(haptics.light)();
        nextProgress.value = withSpring(1, { damping: 18, stiffness: 220 });
        prevProgress.value = 0;
        dragX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 240 }, () => {
          if (isLast) {
            runOnJS(commitFinish)();
          } else {
            runOnJS(commitNext)();
          }
        });
      } else if (goRight) {
        animating.value = true;
        runOnJS(haptics.light)();
        prevProgress.value = withSpring(1, { damping: 18, stiffness: 220 });
        nextProgress.value = 0;
        dragX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 240 }, () => {
          runOnJS(commitPrev)();
        });
      } else {
        dragX.value = withSpring(0, { damping: 20, stiffness: 300 });
        nextProgress.value = withSpring(0, { damping: 20, stiffness: 300 });
        prevProgress.value = withSpring(0, { damping: 20, stiffness: 300 });
      }
    });

  const handleFlip = () => {
    if (swipedRef.current) return;
    const goToBack = flipProgress.value < 0.5;
    flipProgress.value = withTiming(goToBack ? 1 : 0, FLIP_TOGGLE_CONFIG);
    haptics.light();
  };

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
        <Text style={styles.discretionHint}>tryck för att fortsätta</Text>
      </Pressable>
    );
  }

  if (!deck) return null;

  const topCard: Card | undefined = deck.cards[topIndex];
  const nextCardData: Card | undefined = deck.cards[topIndex + 1];
  const prevCardData: Card | undefined = deck.cards[topIndex - 1];
  const isLast = topIndex === deck.cards.length - 1;

  if (!topCard) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safe}>
        <AppHeader onBack={handleClose} />

        <View style={styles.cardArea}>
          {/* Show prev or next card behind the top card depending on drag direction.
              Never show both — avoids z-order conflicts and double-card flash. */}
          {prevCardData && (
            <Animated.View style={[styles.card, prevCardStyle]}>
              <View style={[styles.cardFace, { backgroundColor: prevCardData.deckBackground ?? deck.cardBackground }]}>
                <CardFace card={prevCardData} deck={deck} cardIndex={topIndex - 1} totalCards={deck.cards.length} />
                {topIndex - 1 > 0 && <View style={[styles.dotLeft, { backgroundColor: prevCardData.deckText ?? deck.cardText }]} />}
                <View style={[styles.dotRight, { backgroundColor: prevCardData.deckText ?? deck.cardText }]} />
              </View>
            </Animated.View>
          )}
          {nextCardData && (
            <Animated.View style={[styles.card, nextCardStyle]}>
              <View style={[styles.cardFace, { backgroundColor: nextCardData.deckBackground ?? deck.cardBackground }]}>
                <CardFace card={nextCardData} deck={deck} cardIndex={topIndex + 1} totalCards={deck.cards.length} />
                <View style={[styles.dotLeft, { backgroundColor: nextCardData.deckText ?? deck.cardText }]} />
                {topIndex + 1 < deck.cards.length - 1 && <View style={[styles.dotRight, { backgroundColor: nextCardData.deckText ?? deck.cardText }]} />}
              </View>
            </Animated.View>
          )}

          {/* Top card — pan gesture for swipe, Pressable inside for flip */}
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.card, topCardStyle]}>
              <Pressable style={styles.cardPressable} onPress={handleFlip}>
                {/* Front face — rotates 0→180deg, backfaceVisibility hides it past 90deg */}
                <Animated.View style={[styles.cardFace, { backgroundColor: topCard.deckBackground ?? deck.cardBackground }, frontFaceStyle]}>
                  <CardFace card={topCard} deck={deck} cardIndex={topIndex} totalCards={deck.cards.length} />
                  {topIndex > 0 && <View style={[styles.dotLeft, { backgroundColor: topCard.deckText ?? deck.cardText }]} />}
                  {!isLast && <View style={[styles.dotRight, { backgroundColor: topCard.deckText ?? deck.cardText }]} />}
                </Animated.View>
                {/* Back face — rotates -180→0deg, appears once past 90deg */}
                <Animated.View style={[styles.cardFace, styles.cardFaceBack, backFaceStyle]}>
                  <CardBack deck={deck} />
                </Animated.View>
              </Pressable>
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
                klar
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
  cardArea: {
    flex: 1,
    justifyContent: "center",
  },
  card: {
    position: "absolute",
    width: "100%",
    height: CARD_HEIGHT,
    borderRadius: radius.xl,
  },
  cardPressable: {
    width: "100%",
    height: CARD_HEIGHT,
  },
  // Each face fills the card exactly and handles its own padding/layout
  cardFace: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radius.xl,
    padding: spacing.xl,
    justifyContent: "space-between",
    backfaceVisibility: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: -10, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  cardFaceBack: {
    backgroundColor: colors.textPrimary,
  },
  // Back face content
  cardBackContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  cardBackIcon: {
    fontSize: 64,
    lineHeight: 72,
  },
  cardBackTitle: {
    ...typography.label,
    letterSpacing: 2,
    textAlign: "center",
  },
  cardBackHint: {
    ...typography.caption,
    color: colors.textMuted,
    letterSpacing: 1,
    marginTop: spacing.sm,
    fontStyle: "italic",
  },
  // Front face inner elements
  modeRow: {},
  modeIndicator: { ...typography.label, letterSpacing: 1.5 },
  questionBlock: { flex: 1, justifyContent: "center" },
  whoHere: {
    fontSize: 17,
    lineHeight: 26,
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
  cardCounter: {
    ...typography.caption,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  difficultyRow: { flexDirection: "row", gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  intensityRow: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" },
  intensityChip: { flexDirection: "row", alignItems: "center", gap: 5 },
  intensityLabel: {
    fontSize: 10,
    fontWeight: "500",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  intensityDots: { flexDirection: "row", gap: 3 },
  dotLeft: {
    position: "absolute",
    bottom: spacing.xl,
    left: spacing.xl,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.textMuted,
    opacity: 0.5,
  },
  dotRight: {
    position: "absolute",
    bottom: spacing.xl,
    right: spacing.xl,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.textMuted,
    opacity: 0.5,
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
