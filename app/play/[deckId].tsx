import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import Svg, { Defs, Path, Pattern, Rect } from "react-native-svg";
import { DeckIcon } from "../../src/components/DeckIcon";

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
import { animation, AppColors, dimensions, fonts, radius, spacing, typography } from "../../src/constants/theme";
import { useColors } from "../../src/hooks/useColors";
import AppHeader from "../../src/components/AppHeader";
import { useHaptics } from "../../src/hooks/useHaptics";
import { useGameStore } from "../../src/store/gameStore";
import { Card, Deck } from "../../src/types";
import allDecks from "../../assets/data/decks/index";

const SWIPE_DISTANCE = 60;
const SWIPE_VELOCITY = 400;

// Next card resting state offsets (peeks behind top card)
const NEXT_TRANSLATE_Y = 20;
const NEXT_SCALE = 0.94;

// Flip animation config
const FLIP_TOGGLE_CONFIG = { duration: animation.quick, easing: Easing.inOut(Easing.ease) };

// In light mode: white card + dark text.
// In dark mode: original deck-defined background/text.
function resolveCardColors(
  card: Card,
  deck: Deck,
  colors: AppColors,
  colorScheme: 'dark' | 'light',
): { bg: string; text: string } {
  if (colorScheme === 'light') {
    return { bg: colors.card, text: colors.textPrimary };
  }
  const bg = card.deckBackground ?? deck.cardBackground ?? colors.card;
  const text = card.deckText ?? deck.cardText ?? colors.textPrimary;
  return { bg, text };
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: spacing.md,
    },
    cardArea: {
      flex: 1,
      justifyContent: "center",
    },
    card: {
      position: "absolute",
      width: "100%",
      height: dimensions.cardHeight,
      borderRadius: radius.xl,
    },
    cardPressable: {
      width: "100%",
      height: dimensions.cardHeight,
    },
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
      shadowColor: colors.bgBlack,
      shadowOffset: { width: -10, height: 10 },
      shadowOpacity: 0.12,
      shadowRadius: spacing.sm,
      elevation: 3,
    },
    cardFaceBack: {},
    cardBackContent: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    modeRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    modeIndicatorText: { ...typography.label, letterSpacing: 1.5 },
    iconRow: { marginTop: spacing.sm, alignItems: "center" },
    questionBlock: { flex: 1, justifyContent: "center", marginBottom: spacing.xxxl },
    cardBottom: { gap: spacing.xs },
    bottomRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    bottomRowLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },
    bottomRowRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },
    bottomRowText: {
      ...typography.label,
      letterSpacing: 1.5,
      fontFamily: fonts.heading,
      includeFontPadding: false,
      textAlignVertical: "center",
    },
    whoHere: {
      ...typography.heading,
      fontSize: 28,
      color: colors.accent,
    },
    question: {
      ...typography.heading,
      fontFamily: fonts.question,
      color: colors.textPrimary,
      letterSpacing: 0.1,
    },
    followUpBlock: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: spacing.md,
      marginBottom: spacing.sm,
    },
    followUpLabel: {
      ...typography.caption,
      color: colors.textMuted,
      marginBottom: spacing.xs,
      fontStyle: "italic",
      letterSpacing: 0.5,
    },
    followUp: {
      ...typography.caption,
      color: colors.textSecondary,
      fontStyle: "italic",
    },
    cardCounter: {
      ...typography.label,
      letterSpacing: 1.5,
    },
    nav: {
      flexDirection: "row",
      alignItems: "center",
      paddingBottom: spacing.lg,
      paddingTop: spacing.md,
      paddingHorizontal: spacing.sm,
      gap: spacing.md,
    },
    finishBtn: {
      flex: 1,
      height: dimensions.iconTouchSize,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.md,
      borderWidth: 1,
    },
    finishBtnText: { ...typography.bodyMedium, letterSpacing: 0.5 },

  });
}


function CardFace({ card, deck, cardIndex, totalCards, colors, resolvedText, canGoBack, canGoForward }: { card: Card; deck: Deck; cardIndex: number; totalCards: number; colors: AppColors; resolvedText: string; canGoBack: boolean; canGoForward: boolean }) {
  const styles = makeStyles(colors);
  const icon = card.deckIcon ?? deck.icon;
  const svgIcon = card.deckSvgIcon ?? deck.svgIcon;
  const title = card.deckTitle ?? deck.title;
  const color = card.deckColor ?? deck.color;
  const cardText = resolvedText;

  return (
    <>

      <View style={styles.iconRow}>
        <DeckIcon deck={{ icon, svgIcon, color }} size={36} color={color} />
      </View>
      <View style={styles.questionBlock}>
        <Text style={[styles.whoHere, { color }]}>Vem här…</Text>
        <Text style={[styles.question, { color: cardText }]}>{card.question}</Text>
      </View>
      <View style={styles.cardBottom}>
        {card.followUp && (
          <View style={[styles.followUpBlock, { borderTopColor: `${cardText}22` }]}>
            <Text style={[styles.followUpLabel, { color: `${cardText}66` }]}>följdfråga —</Text>
            <Text style={[styles.followUp, { color: `${cardText}99` }]}>{card.followUp}</Text>
          </View>
        )}
        <View style={styles.bottomRow}>
          <View style={styles.bottomRowLeft}>
            <Text style={[styles.bottomRowText, { color: canGoBack ? color : colors.textMuted }]}>‹</Text>
            <Text style={[styles.bottomRowText, { color: colors.textMuted }]}>{title.toUpperCase()}</Text>
          </View>
          <View style={styles.bottomRowRight}>
            <Text style={[styles.bottomRowText, { color: colors.textMuted }]}>{cardIndex + 1} / {totalCards}</Text>
            <Text style={[styles.bottomRowText, { color: canGoForward ? color : colors.textMuted }]}>›</Text>
          </View>
        </View>
      </View>
    </>
  );
}

function CardBackPattern({ color }: { color: string }) {
  return (
    <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: radius.xl, overflow: "hidden" }}>
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern id="circuit" x="0" y="0" width="180" height="180" patternUnits="userSpaceOnUse">
            <Path d="M82.42 180h-1.415L0 98.995v-2.827L6.167 90 0 83.833V81.004L81.005 0h2.827L90 6.167 96.167 0H98.996L180 81.005v2.827L173.833 90 180 96.167V98.996L98.995 180h-2.827L90 173.833 83.833 180H82.42zm0-1.414L1.413 97.58 8.994 90l-7.58-7.58L82.42 1.413 90 8.994l7.58-7.58 81.006 81.005-7.58 7.58 7.58 7.58-81.005 81.006-7.58-7.58-7.58 7.58zM175.196 0h-25.832c1.033 2.924 2.616 5.59 4.625 7.868C152.145 9.682 151 12.208 151 15c0 5.523 4.477 10 10 10 1.657 0 3 1.343 3 3v4h16V0h-4.803c.51.883.803 1.907.803 3 0 3.314-2.686 6-6 6s-6-2.686-6-6c0-1.093.292-2.117.803-3h10.394-13.685C161.18.938 161 1.948 161 3v4c-4.418 0-8 3.582-8 8s3.582 8 8 8c2.76 0 5 2.24 5 5v2h4v-4h2v4h4v-4h2v4h2V0h-4.803zm-15.783 0c-.27.954-.414 1.96-.414 3v2.2c-1.25.254-2.414.74-3.447 1.412-1.716-1.93-3.098-4.164-4.054-6.612h7.914zM180 17h-3l2.143-10H180v10zm-30.635 163c-.884-2.502-1.365-5.195-1.365-8 0-13.255 10.748-24 23.99-24H180v32h-30.635zm12.147 0c.5-1.416 1.345-2.67 2.434-3.66l-1.345-1.48c-1.498 1.364-2.62 3.136-3.186 5.14H151.5c-.97-2.48-1.5-5.177-1.5-8 0-12.15 9.84-22 22-22h8v30h-18.488zm13.685 0c-1.037-1.793-2.976-3-5.197-3-2.22 0-4.16 1.207-5.197 3h10.394zM0 148h8.01C21.26 148 32 158.742 32 172c0 2.805-.48 5.498-1.366 8H0v-32zm0 2h8c12.15 0 22 9.847 22 22 0 2.822-.53 5.52-1.5 8h-7.914c-.567-2.004-1.688-3.776-3.187-5.14l-1.346 1.48c1.09.99 1.933 2.244 2.434 3.66H0v-30zm15.197 30c-1.037-1.793-2.976-3-5.197-3-2.22 0-4.16 1.207-5.197 3h10.394zM0 32h16v-4c0-1.657 1.343-3 3-3 5.523 0 10-4.477 10-10 0-2.794-1.145-5.32-2.992-7.134C28.018 5.586 29.6 2.924 30.634 0H0v32zm0-2h2v-4h2v4h4v-4h2v4h4v-2c0-2.76 2.24-5 5-5 4.418 0 8-3.582 8-8s-3.582-8-8-8V3c0-1.052-.18-2.062-.512-3H0v30zM28.5 0c-.954 2.448-2.335 4.683-4.05 6.613-1.035-.672-2.2-1.16-3.45-1.413V3c0-1.04-.144-2.046-.414-3H28.5zM0 17h3L.857 7H0v10zM15.197 0c.51.883.803 1.907.803 3 0 3.314-2.686 6-6 6S4 6.314 4 3c0-1.093.292-2.117.803-3h10.394zM109 115c-1.657 0-3 1.343-3 3v4H74v-4c0-1.657-1.343-3-3-3-5.523 0-10-4.477-10-10 0-2.793 1.145-5.318 2.99-7.132C60.262 93.638 58 88.084 58 82c0-13.255 10.748-24 23.99-24h16.02C111.26 58 122 68.742 122 82c0 6.082-2.263 11.636-5.992 15.866C117.855 99.68 119 102.206 119 105c0 5.523-4.477 10-10 10zm0-2c-2.76 0-5 2.24-5 5v2h-4v-4h-2v4h-4v-4h-2v4h-4v-4h-2v4h-4v-4h-2v4h-4v-2c0-2.76-2.24-5-5-5-4.418 0-8-3.582-8-8s3.582-8 8-8v-4c0-2.64 1.136-5.013 2.946-6.66L72.6 84.86C70.39 86.874 69 89.775 69 93v2.2c-1.25.254-2.414.74-3.447 1.412C62.098 92.727 60 87.61 60 82c0-12.15 9.84-22 22-22h16c12.15 0 22 9.847 22 22 0 5.61-2.097 10.728-5.55 14.613-1.035-.672-2.2-1.16-3.45-1.413V93c0-3.226-1.39-6.127-3.6-8.14l-1.346 1.48C107.864 87.987 109 90.36 109 93v4c4.418 0 8 3.582 8 8s-3.582 8-8 8zM90.857 97L93 107h-6l2.143-10h1.714zM80 99c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6zm20 0c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6z" fill={color} fillOpacity={0.075} fillRule="evenodd" />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#circuit)" />
      </Svg>
    </View>
  );
}

function CardBack({ card, deck, colors }: { card: Card; deck: Deck; colors: AppColors }) {
  const styles = makeStyles(colors);
  const icon = card.deckIcon ?? deck.icon;
  const svgIcon = card.deckSvgIcon ?? deck.svgIcon;
  const color = card.deckColor ?? deck.color;

  return (
    <View style={{ flex: 1 }}>
      {/* Repeating circuit pattern */}
      <CardBackPattern color={color} />


      {/* Corner pips — top-left & bottom-right (rotated 180) */}
      <View style={{ position: "absolute", top: 22, left: 22, opacity: 0.7 }}>
        <DeckIcon deck={{ icon, svgIcon, color }} size={18} color={color} />
      </View>
      <View style={{ position: "absolute", bottom: 22, right: 22, opacity: 0.7, transform: [{ rotate: "180deg" }] }}>
        <DeckIcon deck={{ icon, svgIcon, color }} size={18} color={color} />
      </View>

      {/* Center icon */}
      <View style={styles.cardBackContent}>
        <DeckIcon deck={{ icon, svgIcon, color }} size={96} color={color} />
      </View>
    </View>
  );
}

export default function PlayScreen() {
  const colors = useColors();
  const styles = makeStyles(colors);
  const colorScheme = useGameStore((s) => s.colorScheme);

  const router = useRouter();
  const { deckId } = useLocalSearchParams<{ deckId: string }>();
  const haptics = useHaptics();
  const { width: SCREEN_WIDTH } = useWindowDimensions();

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
    dragX.value = 0;
    nextProgress.value = 0;
    prevProgress.value = 0;
    animating.value = false;
  }, [nextCardStore]);

  const commitPrev = useCallback(() => {
    prevCardStore();
    setTopIndex((i) => i - 1);
    dragX.value = 0;
    nextProgress.value = 0;
    prevProgress.value = 0;
    animating.value = false;
  }, [prevCardStore]);

  const commitFinish = useCallback(() => {
    endGame();
    router.replace("/play/results");
  }, [endGame, router]);

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
        dragX.value = e.translationX * 0.08;
        nextProgress.value = 0;
        prevProgress.value = 0;
      } else if (isLast && e.translationX < 0) {
        dragX.value = e.translationX;
        nextProgress.value = 0;
        prevProgress.value = 0;
      } else if (e.translationX < 0) {
        dragX.value = e.translationX;
        nextProgress.value = Math.min(
          1,
          -e.translationX / (SCREEN_WIDTH * 0.55),
        );
        prevProgress.value = 0;
      } else {
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
          {prevCardData && (() => {
            const rc = resolveCardColors(prevCardData, deck, colors, colorScheme);
            return (
              <Animated.View style={[styles.card, prevCardStyle]}>
                <View style={[styles.cardFace, { backgroundColor: colors.card }]}>
                  <CardFace card={prevCardData} deck={deck} cardIndex={topIndex - 1} totalCards={deck.cards.length} colors={colors} resolvedText={rc.text} canGoBack={topIndex - 1 > 0} canGoForward={true} />
                </View>
              </Animated.View>
            );
          })()}
          {nextCardData && (() => {
            const rc = resolveCardColors(nextCardData, deck, colors, colorScheme);
            return (
              <Animated.View style={[styles.card, nextCardStyle]}>
                <View style={[styles.cardFace, { backgroundColor: colors.card }]}>
                  <CardFace card={nextCardData} deck={deck} cardIndex={topIndex + 1} totalCards={deck.cards.length} colors={colors} resolvedText={rc.text} canGoBack={true} canGoForward={topIndex + 1 < deck.cards.length - 1} />
                </View>
              </Animated.View>
            );
          })()}

          <GestureDetector gesture={panGesture}>
            {(() => {
              const rc = resolveCardColors(topCard, deck, colors, colorScheme);
              return (
                <Animated.View style={[styles.card, topCardStyle]}>
                  <Pressable style={styles.cardPressable} onPress={handleFlip}>
                    <Animated.View style={[styles.cardFace, { backgroundColor: colors.card }, frontFaceStyle]}>
                      <CardFace card={topCard} deck={deck} cardIndex={topIndex} totalCards={deck.cards.length} colors={colors} resolvedText={rc.text} canGoBack={topIndex > 0} canGoForward={!isLast} />
                    </Animated.View>
                    <Animated.View style={[styles.cardFace, { backgroundColor: rc.bg, padding: 0 }, backFaceStyle]}>
                      <CardBack card={topCard} deck={deck} colors={colors} />
                    </Animated.View>
                  </Pressable>
                </Animated.View>
              );
            })()}
          </GestureDetector>
        </View>

        <View style={styles.nav}>
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
