import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Extrapolation,
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
const STACK_OFFSET_Y = 6;
const STACK_SCALE_STEP = 0.04;

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
      height: dimensions.cardHeight,
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
      shadowColor: colors.bgBlack,
      shadowOffset: { width: 10, height: 10 },
      shadowOpacity: 0.12,
      shadowRadius: spacing.sm,
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
  }, [cardIndex, deck]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-15, 15])
    .onUpdate((e) => {
      "worklet";
      if (isAnimating.value) return;
      translateX.value = Math.min(0, e.translationX);
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
          { duration: 200 },
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
        translateX.value = withSpring(0, {
          damping: 20,
          stiffness: 200,
          mass: 0.5,
        });
      }
    });

  /* ── Animated styles for each stack level ────────────────────────────── */
  const topCardStyle = useAnimatedStyle(() => {
    "worklet";
    return {
      transform: [
        { translateX: translateX.value },
        {
          rotate: `${interpolate(
            translateX.value,
            [-DISMISS_DISTANCE, 0, DISMISS_DISTANCE],
            [-MAX_ROTATION, 0, MAX_ROTATION],
            Extrapolation.CLAMP
          )}deg`,
        },
      ],
    };
  });

  const secondCardStyle = useAnimatedStyle(() => {
    "worklet";
    const progress = Math.min(Math.abs(translateX.value) / SWIPE_THRESHOLD, 1);
    return {
      transform: [
        { translateY: interpolate(progress, [0, 1], [STACK_OFFSET_Y, 0]) },
        { scale: interpolate(progress, [0, 1], [1 - STACK_SCALE_STEP, 1]) },
      ],
    };
  });

  const thirdCardStyle = useAnimatedStyle(() => {
    "worklet";
    const progress = Math.min(Math.abs(translateX.value) / SWIPE_THRESHOLD, 1);
    return {
      transform: [
        { translateY: interpolate(progress, [0, 1], [STACK_OFFSET_Y * 2, STACK_OFFSET_Y]) },
        { scale: interpolate(progress, [0, 1], [1 - STACK_SCALE_STEP * 2, 1 - STACK_SCALE_STEP]) },
      ],
    };
  });

  /* ── Helpers ─────────────────────────────────────────────────────────── */
  const handleClose = () => {
    endGame();
    router.back();
  };

  if (!deck) return null;

  const totalCards = deck.cards.length;

  function renderCard(
    index: number,
    animStyle: ReturnType<typeof useAnimatedStyle>,
    zIndex: number,
  ) {
    if (index > totalCards) return null;

    const isEnd = index >= totalCards;
    const card = isEnd ? undefined : deck!.cards[index];

    return (
      <Animated.View
        key={`card-${index}`}
        style={[
          styles.cardFace,
          styles.cardAbsolute,
          { zIndex },
          animStyle,
        ]}
        pointerEvents={zIndex === 3 ? "auto" : "none"}
      >
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
            deck={deck!}
            cardIndex={index}
            totalCards={totalCards}
            colors={colors}
            styles={styles}
          />
        ) : null}
      </Animated.View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader />

      <View style={styles.cardArea}>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={styles.stackContainer}>
            {renderCard(cardIndex + 2, thirdCardStyle, 1)}
            {renderCard(cardIndex + 1, secondCardStyle, 2)}
            {renderCard(cardIndex, topCardStyle, 3)}
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
