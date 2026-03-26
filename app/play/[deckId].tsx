import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { animation, AppColors, dimensions, radius, spacing, typography } from "../../src/constants/theme";
import { useColors } from "../../src/hooks/useColors";
import AppHeader from "../../src/components/AppHeader";
import { EndCard } from "../../src/components/EndCard";
import { useHaptics } from "../../src/hooks/useHaptics";
import { usePurchase } from "../../src/hooks/usePurchase";
import { useGameStore } from "../../src/store/gameStore";
import { Card, Deck } from "../../src/types";
import allDecks from "../../assets/data/decks/index";
import { DeckIcon } from "../../src/components/DeckIcon";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const SWIPE_DISTANCE = 60;
const SWIPE_VELOCITY = 400;

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
    closeRow: {
      alignItems: 'center',
      paddingBottom: spacing.lg,
      paddingTop: spacing.sm,
    },
    closeBtn: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.bgCard,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeBtnText: {
      ...typography.body,
      color: colors.textOnCard,
      lineHeight: 20,
    },
    cardWrapper: {
      position: "absolute",
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
      flexDirection: "column",
      justifyContent: "space-between",
      shadowColor: colors.bgBlack,
      shadowOffset: { width: 10, height: 10 },
      shadowOpacity: 0.12,
      shadowRadius: spacing.sm,
      elevation: 3,
    },
    questionBlock: { flex: 1, justifyContent: "center" },
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
    whoHere: {
      ...typography.brand,
      marginBottom: spacing.md,
      textTransform: "uppercase" as const,
      letterSpacing: 2,
    },
    question: {
      ...typography.card,
      color: colors.textOnCard,
    },
  });
}

const CardFace = React.memo(function CardFace({
  card,
  deck,
  cardIndex,
  totalCards,
  colors,
  styles,
  modeTint,
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
        <Text selectable={false} style={[styles.whoHere, { color: colors.textOnCard }]}>Vem här…</Text>
        <Text
          selectable={false}
          style={styles.question}
          android_hyphenationFrequency="full"
        >
          ...{card.question.toUpperCase()}
        </Text>
      </View>
      <View style={styles.cardBottom}>
        <View style={styles.bottomRow}>
          <View style={styles.bottomRowLeft}>
            <DeckIcon deck={{ icon, svgIcon }} size={18} color={colors.textOnCard} />
            <Text selectable={false} style={[styles.bottomRowText, { color: colors.textOnCard }]} numberOfLines={1}>
              {title.toUpperCase()}
            </Text>
          </View>
          <View>
            <Text selectable={false} style={[styles.bottomRowText, { color: colors.textOnCard }]}>
              {cardIndex + 1} / {totalCards}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
});

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

  const [topIndex, setTopIndex] = useState(0);

  const dragX = useRef(new Animated.Value(0)).current;

  const topIndexRef = useRef(topIndex);
  topIndexRef.current = topIndex;

  useEffect(() => {
    if (!activeDeck && deckId) {
      const deck = allDecks.find((d) => d.id === deckId);
      if (deck) {
        startGame(deck, deck.mode[0]);
        setTopIndex(0);
      } else {
        // Curated deck was not pre-loaded via startGame — navigate home
        router.replace('/');
      }
    }
  }, [deckId]);

  const deck = activeDeck;

  const goNext = () => {
    const cur = topIndexRef.current;
    const next = cur + 1;
    if (!deck) return;
    if (cur >= deck.cards.length) {
      endGame();
      Animated.timing(dragX, { toValue: -SCREEN_WIDTH * 1.5, duration: 220, useNativeDriver: true }).start(() => {
        router.replace("/");
      });
      return;
    }
    nextCardStore();
    Animated.timing(dragX, { toValue: -SCREEN_WIDTH * 1.5, duration: 220, useNativeDriver: true }).start(() => {
      setTopIndex(next);
      requestAnimationFrame(() => dragX.setValue(0));
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderGrant: () => {
        dragX.stopAnimation();
      },
      onPanResponderMove: (_, g) => {
        if (g.dx > 0) return;
        dragX.setValue(g.dx);
      },
      onPanResponderRelease: (_, g) => {
        const goLeft = g.dx < -SWIPE_DISTANCE || g.vx < -(SWIPE_VELOCITY / 1000);
        if (goLeft) {
          hapticsRef.current.light();
          goNext();
        } else {
          Animated.spring(dragX, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 300 }).start();
        }
      },
    })
  ).current;

  const topCardAnimStyle = {
    transform: [
      { translateX: dragX },
      {
        rotate: dragX.interpolate({
          inputRange: [-SCREEN_WIDTH, 0],
          outputRange: ["-7deg", "0deg"],
          extrapolate: "clamp",
        }),
      },
    ],
  };

  const handleClose = () => {
    endGame();
    router.back();
  };

  if (!deck) return null;

  const isResultsCard = topIndex === deck.cards.length;
  const topCard: Card | undefined = isResultsCard ? undefined : deck.cards[topIndex];
  const undercardIdx = topIndex + 1;
  const isUndercardResults = undercardIdx === deck.cards.length;
  const nextCard: Card | undefined = isUndercardResults ? undefined : deck.cards[undercardIdx];

  const nextCardOpacity = dragX.interpolate({
    inputRange: [-SCREEN_WIDTH * 1.5, -SWIPE_DISTANCE, 0, SWIPE_DISTANCE, SCREEN_WIDTH * 1.5],
    outputRange: [1, 1, 0, 1, 1],
    extrapolate: "clamp",
  });

  const nextCardScale = dragX.interpolate({
    inputRange: [-SCREEN_WIDTH * 1.5, -SWIPE_DISTANCE, 0, SWIPE_DISTANCE, SCREEN_WIDTH * 1.5],
    outputRange: [1, 1, 0.96, 1, 1],
    extrapolate: "clamp",
  });

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader />

      <View style={styles.cardArea} {...panResponder.panHandlers}>
        {/* Next card sits underneath — peeks when swiping */}
        {isUndercardResults && (
          <Animated.View style={[styles.cardWrapper, { opacity: nextCardOpacity, transform: [{ scale: nextCardScale }] }]} pointerEvents="none">
            <View style={[styles.cardFace, { backgroundColor: colors.bgCard, opacity: 0.5 }]}>
              <EndCard
                variant={isPremium ? 'completion' : 'paywall'}
                onUnlock={() => {}}
                onReplay={() => {}}
                onHome={() => {}}
                colors={colors}
              />
            </View>
          </Animated.View>
        )}
        {nextCard && (
          <Animated.View style={[styles.cardWrapper, { opacity: nextCardOpacity, transform: [{ scale: nextCardScale }] }]}>
            <View style={[styles.cardFace, { backgroundColor: colors.bgCard }]}>
              <CardFace
                card={nextCard}
                deck={deck}
                cardIndex={undercardIdx}
                totalCards={deck.cards.length}
                colors={colors}
                styles={styles}
              />
            </View>
          </Animated.View>
        )}

        {/* Top card — draggable */}
        <Animated.View style={[styles.cardWrapper, topCardAnimStyle]}>
          {isResultsCard ? (
            <View style={[styles.cardFace, { backgroundColor: colors.bgCard }]}>
              <EndCard
                variant={isPremium ? 'completion' : 'paywall'}
                onUnlock={purchasePremium}
                onReplay={() => {
                  endGame();
                  router.back();
                }}
                onHome={() => {
                  endGame();
                  router.replace('/');
                }}
                colors={colors}
              />
            </View>
          ) : (
            <View style={[styles.cardFace, { backgroundColor: colors.bgCard }]}>
              <CardFace
                card={topCard!}
                deck={deck}
                cardIndex={topIndex}
                totalCards={deck.cards.length}
                colors={colors}
                styles={styles}
              />
            </View>
          )}
        </Animated.View>
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
