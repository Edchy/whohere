import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  SharedValue,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppColors, dimensions, radius, spacing, typography } from "../../src/constants/theme";
import { useColors } from "../../src/hooks/useColors";
import AppHeader from "../../src/components/AppHeader";
import { EndCard } from "../../src/components/EndCard";
import { useHaptics } from "../../src/hooks/useHaptics";
import { usePurchase } from "../../src/hooks/usePurchase";
import { useGameStore } from "../../src/store/gameStore";
import { Card, Deck } from "../../src/types";
import allDecks from "../../assets/data/decks/index";
import { DeckIcon } from "../../src/components/DeckIcon";

/* ── Animation constants ─────────────────────────────────────────────────── */
const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = 80;
const SWIPE_VELOCITY_THRESHOLD = 500;
const DISMISS_DISTANCE = SCREEN_WIDTH * 1.2;
const MAX_ROTATION = 15;
const MAX_VISIBLE_STACK = 5;
const STACK_OFFSET_Y = 10;
const STACK_OFFSET_X_VARIANCE = 1.2;
const STACK_ROTATION_VARIANCE = 0.4;
const STACK_SCALE_STEP = 0.03;
const Y_TILT_MAX = 8;

const SHADOW_BASE_OPACITY = 0.10;
const SHADOW_LIFT_OPACITY = 0.25;
const SHADOW_BASE_RADIUS = 8;
const SHADOW_LIFT_RADIUS = 20;

const SPRING_SNAP_BACK = { damping: 22, stiffness: 280, mass: 0.4 };
const DISMISS_DURATION = 220;

const IS_IOS = Platform.OS === "ios";

/* ── Deterministic jitter for "messy" stack look ─────────────────────────── */
function getStackJitter(cardIdx: number): { x: number; rotDeg: number } {
  const seed = ((cardIdx * 2654435761) >>> 0) / 4294967296;
  return {
    x: (seed - 0.5) * 2 * STACK_OFFSET_X_VARIANCE,
    rotDeg: (seed - 0.5) * 2 * STACK_ROTATION_VARIANCE,
  };
}

/* ── Styles ──────────────────────────────────────────────────────────────── */
function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.bgPrimary,
      paddingHorizontal: spacing.md,
    },
    cardArea: {
      flex: 1,
      justifyContent: "center",
    },
    stackContainer: {
      height: dimensions.cardHeight + STACK_OFFSET_Y * MAX_VISIBLE_STACK,
    },
    closeRow: {
      alignItems: "center",
      paddingBottom: spacing.lg,
      paddingTop: spacing.sm,
    },
    closeBtn: {
      width: 48,
      height: 48,
      borderRadius: radius.full,
      backgroundColor: colors.bgCard,
      alignItems: "center",
      justifyContent: "center",
    },
    closeBtnText: {
      ...typography.body,
      color: colors.textOnCard,
      lineHeight: 20,
    },
    cardFace: {
      height: dimensions.cardHeight,
      borderRadius: radius.md,
      padding: spacing.xl,
      flexDirection: "column",
      justifyContent: "space-between",
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
      shadowColor: colors.bgBlack,
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: SHADOW_BASE_OPACITY,
      shadowRadius: SHADOW_BASE_RADIUS,
      elevation: 3,
    },
    cardAbsolute: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
    },
    questionBlock: { flex: 1 },
    questionText: { marginTop: spacing.md },
    cardBottom: { gap: spacing.xs },
    bottomRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    bottomRowLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    bottomRowText: {
      ...typography.badge,
      letterSpacing: 1.5,
    },
    whoHereWrapper: {
      alignSelf: "flex-start",
      backgroundColor: colors.textOnBrand,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      marginTop: spacing.lg,
    },
    whoHere: {
      ...typography.brand,
      color: colors.accent,
      textTransform: "uppercase" as const,
      letterSpacing: 2,
    },
    question: {
      ...typography.card,
      color: colors.textOnCard,
    },
  });
}

/* ── CardFace (presentational) ───────────────────────────────────────────── */
const CardFace = React.memo(function CardFace({
  card,
  deck,
  cardIndex,
  totalCards,
  colors,
  styles,
}: {
  card: Card;
  deck: Deck;
  cardIndex: number;
  totalCards: number;
  colors: AppColors;
  styles: ReturnType<typeof makeStyles>;
}) {
  const icon = card.deckIcon ?? deck.icon;
  const svgIcon = card.deckSvgIcon ?? deck.svgIcon;
  const title = card.deckTitle ?? deck.title;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.questionBlock}>
        <View style={styles.whoHereWrapper}>
          <Text selectable={false} style={styles.whoHere}>
            Vem här…
          </Text>
        </View>
        <View style={styles.questionText}>
          <Text
            selectable={false}
            style={styles.question}
            android_hyphenationFrequency="full"
          >
… {card.question.toUpperCase()}
          </Text>
        </View>
      </View>
      <View style={styles.cardBottom}>
        <View style={styles.bottomRow}>
          <View style={styles.bottomRowLeft}>
            <DeckIcon deck={{ icon, svgIcon }} size={18} color={colors.textOnCard} />
            <Text
              selectable={false}
              style={[styles.bottomRowText, { color: colors.textOnCard }]}
              numberOfLines={1}
            >
              {title.toUpperCase()}
            </Text>
          </View>
          <Text selectable={false} style={[styles.bottomRowText, { color: colors.textOnCard }]}>
            {cardIndex + 1} / {totalCards}
          </Text>
        </View>
      </View>
    </View>
  );
});

/* ── StackDimOverlay ─────────────────────────────────────────────────────── */
function StackDimOverlay({
  isTop,
  stackLevel,
  translateX,
  promotionProgress,
}: {
  isTop: boolean;
  stackLevel: number;
  translateX: SharedValue<number>;
  promotionProgress: SharedValue<number>;
}) {
  const dimStyle = useAnimatedStyle(() => {
    "worklet";
    const baseDim = Math.min(stackLevel * 0.12, 0.4);

    if (isTop) {
      // Fade out as this card is promoted into top position
      return {
        opacity: interpolate(promotionProgress.value, [0, 1], [baseDim, 0], Extrapolation.CLAMP),
      };
    }

    // Fade dim toward 0 as top card is swiped away
    const swipeProgress = Math.min(Math.abs(translateX.value) / DISMISS_DISTANCE, 1);
    const nextLevelDim = Math.min((stackLevel - 1) * 0.12, 0.4);
    return {
      opacity: interpolate(swipeProgress, [0, 1], [baseDim, nextLevelDim], Extrapolation.CLAMP),
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFillObject,
        { backgroundColor: "#000", borderRadius: radius.md },
        dimStyle,
      ]}
    />
  );
}

/* ── StackCard (animated wrapper per stack level) ────────────────────────── */
const StackCard = React.memo(function StackCard({
  cardIdx,
  stackLevel,
  isTop,
  isBottom,
  jitterX,
  jitterRot,
  translateX,
  enterProgress,
  promotionProgress,
  card,
  deck,
  totalCards,
  isEnd,
  isPremium,
  purchasePremium,
  endGame,
  router,
  colors,
  styles,
}: {
  cardIdx: number;
  stackLevel: number;
  isTop: boolean;
  isBottom: boolean;
  jitterX: number;
  jitterRot: number;
  translateX: SharedValue<number>;
  enterProgress: SharedValue<number>;
  promotionProgress: SharedValue<number>;
  card: Card | undefined;
  deck: Deck;
  totalCards: number;
  isEnd: boolean;
  isPremium: boolean;
  purchasePremium: () => void;
  endGame: () => void;
  router: ReturnType<typeof useRouter>;
  colors: AppColors;
  styles: ReturnType<typeof makeStyles>;
}) {
  const animStyle = useAnimatedStyle(() => {
    "worklet";

    if (isTop) {
      const absX = Math.abs(translateX.value);
      const swipeProgress = Math.min(absX / SWIPE_THRESHOLD, 1);

      // Smooth promotion: animate from old stacked position (level 1) to top (level 0)
      const promotedY = interpolate(promotionProgress.value, [0, 1], [STACK_OFFSET_Y, 0], Extrapolation.CLAMP);
      const promotedScale = interpolate(promotionProgress.value, [0, 1], [1 - STACK_SCALE_STEP, 1], Extrapolation.CLAMP);

      const transforms: any[] = [
        { translateX: translateX.value },
        {
          translateY: promotedY + interpolate(
            absX, [0, SWIPE_THRESHOLD], [0, -Y_TILT_MAX], Extrapolation.CLAMP
          ),
        },
        {
          rotate: `${interpolate(
            translateX.value,
            [-DISMISS_DISTANCE, 0],
            [-MAX_ROTATION, 0],
            Extrapolation.CLAMP
          )}deg`,
        },
        { scale: promotedScale },
      ];

      if (IS_IOS) {
        return {
          transform: transforms,
          shadowOpacity: interpolate(swipeProgress, [0, 1], [SHADOW_BASE_OPACITY, SHADOW_LIFT_OPACITY]),
          shadowRadius: interpolate(swipeProgress, [0, 1], [SHADOW_BASE_RADIUS, SHADOW_LIFT_RADIUS]),
          shadowOffset: {
            width: interpolate(swipeProgress, [0, 1], [2, 8]),
            height: interpolate(swipeProgress, [0, 1], [2, 12]),
          },
        };
      }
      return { transform: transforms };
    }

    // Stack cards (level >= 1) — static resting positions, no swipe-driven movement
    const currentY = STACK_OFFSET_Y * stackLevel;
    const currentScale = 1 - STACK_SCALE_STEP * stackLevel;

    // Bottom card fades in after each commit
    const ep = isBottom ? enterProgress.value : 1;

    return {
      opacity: interpolate(ep, [0, 1], [0.6, 1], Extrapolation.CLAMP),
      transform: [
        { translateY: currentY },
        { translateX: jitterX },
        { scale: currentScale },
        { rotate: `${jitterRot}deg` },
      ],
      ...(IS_IOS ? {
        shadowOpacity: interpolate(
          stackLevel, [0, MAX_VISIBLE_STACK - 1], [SHADOW_BASE_OPACITY, 0.03]
        ),
        shadowRadius: interpolate(
          stackLevel, [0, MAX_VISIBLE_STACK - 1], [SHADOW_BASE_RADIUS, 3]
        ),
      } : {}),
    };
  });

  const zIndex = MAX_VISIBLE_STACK - stackLevel;

  return (
    <Animated.View
      style={[
        styles.cardFace,
        styles.cardAbsolute,
        { zIndex },
        animStyle,
      ]}
      pointerEvents={isTop ? "auto" : "none"}
    >
      <StackDimOverlay
        isTop={isTop}
        stackLevel={stackLevel}
        translateX={translateX}
        promotionProgress={promotionProgress}
      />
      {isEnd ? (
        <EndCard
          variant={isPremium ? "completion" : "paywall"}
          onUnlock={purchasePremium}
          onReplay={() => {
            endGame();
            router.back();
          }}
          onHome={() => {
            endGame();
            router.replace("/");
          }}
          colors={colors}
        />
      ) : card ? (
        <CardFace
          card={card}
          deck={deck}
          cardIndex={cardIdx}
          totalCards={totalCards}
          colors={colors}
          styles={styles}
        />
      ) : null}
    </Animated.View>
  );
});

/* ── PlayScreen ──────────────────────────────────────────────────────────── */
export default function PlayScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const router = useRouter();
  const { deckId } = useLocalSearchParams<{ deckId: string }>();
  const haptics = useHaptics();
  const hapticsRef = useRef(haptics);
  hapticsRef.current = haptics;
  const { isPremium, purchasePremium } = usePurchase();

  const activeDeck = useGameStore((s) => s.activeDeck);
  const startGame = useGameStore((s) => s.startGame);
  const nextCardStore = useGameStore((s) => s.nextCard);
  const endGame = useGameStore((s) => s.endGame);

  const [cardIndex, setCardIndex] = useState(0);

  useEffect(() => {
    if (!activeDeck && deckId) {
      const deck = allDecks.find((d) => d.id === deckId);
      if (deck) {
        startGame(deck, deck.mode[0]);
        setCardIndex(0);
      } else {
        router.replace("/");
      }
    }
  }, [deckId]);

  const deck = activeDeck;

  /* ── Swipe animation ─────────────────────────────────────────────────── */
  const translateX = useSharedValue(0);
  const isAnimating = useSharedValue(false);
  const isOnEndCard = useSharedValue(false);
  const crossedThreshold = useSharedValue(false);
  const enterProgress = useSharedValue(1);
  const promotionProgress = useSharedValue(1);

  const dismissEndCard = useCallback(() => {
    hapticsRef.current.light();
    endGame();
    router.back();
  }, [endGame, router]);

  const commitSwipe = useCallback(() => {
    hapticsRef.current.light();
    nextCardStore();
    setCardIndex((i) => i + 1);
  }, [nextCardStore]);

  // Reset shared values AFTER React has committed the new cardIndex to screen
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (deck) {
      isOnEndCard.value = cardIndex >= deck.cards.length;
    }
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    translateX.value = 0;
    isAnimating.value = false;
    crossedThreshold.value = false;
    // Fade the new bottom card in
    enterProgress.value = 0;
    enterProgress.value = withSpring(1, { damping: 24, stiffness: 200, mass: 0.4 });
    // Smoothly promote new top card from its old stacked position
    promotionProgress.value = 0;
    promotionProgress.value = withSpring(1, { damping: 28, stiffness: 180, mass: 0.6 });
  }, [cardIndex, deck]);

  const fireThresholdHaptic = useCallback(() => {
    hapticsRef.current.medium();
  }, []);

  const fireSnapHaptic = useCallback(() => {
    hapticsRef.current.light();
  }, []);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-15, 15])
    .onUpdate((e) => {
      "worklet";
      if (isAnimating.value) return;
      translateX.value = Math.min(0, e.translationX);

      // Haptic at threshold crossing
      if (!crossedThreshold.value && translateX.value <= -SWIPE_THRESHOLD) {
        crossedThreshold.value = true;
        runOnJS(fireThresholdHaptic)();
      }
      if (crossedThreshold.value && translateX.value > -SWIPE_THRESHOLD) {
        crossedThreshold.value = false;
      }
    })
    .onEnd((e) => {
      "worklet";
      if (isAnimating.value) return;

      const shouldDismiss =
        e.translationX < -SWIPE_THRESHOLD ||
        e.velocityX < -SWIPE_VELOCITY_THRESHOLD;

      if (shouldDismiss) {
        isAnimating.value = true;
        const onEndCard = isOnEndCard.value;
        translateX.value = withTiming(
          -DISMISS_DISTANCE,
          { duration: DISMISS_DURATION, easing: Easing.in(Easing.quad) },
          (finished) => {
            "worklet";
            if (finished) {
              if (onEndCard) {
                runOnJS(dismissEndCard)();
              } else {
                runOnJS(commitSwipe)();
              }
            }
          }
        );
      } else {
        crossedThreshold.value = false;
        translateX.value = withSpring(0, SPRING_SNAP_BACK, (finished) => {
          "worklet";
          if (finished) {
            runOnJS(fireSnapHaptic)();
          }
        });
      }
    });

  /* ── Helpers ─────────────────────────────────────────────────────────── */
  const handleClose = () => {
    endGame();
    router.back();
  };

  if (!deck) return null;

  const totalCards = deck.cards.length;

  // Build the visible stack (bottom to top for correct z-ordering)
  const remainingAfterCurrent = totalCards - cardIndex;
  const visibleCount = Math.min(MAX_VISIBLE_STACK, remainingAfterCurrent + 1); // +1 for EndCard
  const stackCards: React.ReactNode[] = [];

  for (let level = visibleCount - 1; level >= 0; level--) {
    const idx = cardIndex + level;
    if (idx > totalCards) continue; // beyond EndCard
    const isEnd = idx >= totalCards;
    const card = isEnd ? undefined : deck.cards[idx];
    const jitter = level > 0 ? getStackJitter(idx) : { x: 0, rotDeg: 0 };

    stackCards.push(
      <StackCard
        key={`card-${idx}`}
        cardIdx={idx}
        stackLevel={level}
        isTop={level === 0}
        isBottom={level === visibleCount - 1 && visibleCount > 1}
        jitterX={jitter.x}
        jitterRot={jitter.rotDeg}
        translateX={translateX}
        enterProgress={enterProgress}
        promotionProgress={promotionProgress}
        card={card}
        deck={deck}
        totalCards={totalCards}
        isEnd={isEnd}
        isPremium={isPremium}
        purchasePremium={purchasePremium}
        endGame={endGame}
        router={router}
        colors={colors}
        styles={styles}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader />

      <View style={styles.cardArea}>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={styles.stackContainer}>
            {stackCards}
          </Animated.View>
        </GestureDetector>
      </View>

      <View style={styles.closeRow}>
        <TouchableOpacity
          onPress={handleClose}
          activeOpacity={0.7}
          hitSlop={12}
          style={styles.closeBtn}
          accessibilityLabel="Stäng spelet"
          accessibilityRole="button"
        >
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
