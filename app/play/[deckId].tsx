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
    whoHereWrapper: {
      alignSelf: "flex-start",
      backgroundColor: colors.fog ?? "#F2EEE9",
      borderRadius: 999,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      marginBottom: spacing.md,
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
        <View style={styles.whoHereWrapper}>
          <Text selectable={false} style={styles.whoHere}>Vem här…</Text>
        </View>
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

  // topIndex = the card currently sitting at rest on top
  // exitCard = the card being animated off-screen (frozen content, separate element)
  const [topIndex, setTopIndex] = useState(0);
  const [undercardDisplayIndex, setUndercardDisplayIndex] = useState(1);
  const [exitCardIndex, setExitCardIndex] = useState<number | null>(null);

  // dragX drives two things: the live drag of the top card, and the exit fly-off
  const dragX = useRef(new Animated.Value(0)).current;
  // exitX drives only the exit animation — separate from drag so top card is unaffected
  const exitX = useRef(new Animated.Value(0)).current;

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
      // Already on results card — animate it off and go home
      exitX.setValue(dragX.__getValue());
      setExitCardIndex(cur);
      setTopIndex(next); // clears top card
      Animated.timing(exitX, { toValue: -SCREEN_WIDTH * 1.5, duration: 220, useNativeDriver: true }).start(() => {
        setExitCardIndex(null);
        exitX.setValue(0);
        router.replace("/");
      });
      return;
    }
    nextCardStore();
    // Freeze current drag position into exitX, then immediately promote next card to top
    const currentDragX = dragX.__getValue();
    exitX.setValue(currentDragX);
    dragX.setValue(0);
    setExitCardIndex(cur);
    setTopIndex(next);
    setUndercardDisplayIndex(next + 1);
    // Now animate only the exit card off — top card is already at rest with correct content
    Animated.timing(exitX, { toValue: -SCREEN_WIDTH * 1.5, duration: 220, useNativeDriver: true }).start(() => {
      setExitCardIndex(null);
      exitX.setValue(0);
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

  const topCardRotate = useRef(dragX.interpolate({
    inputRange: [-SCREEN_WIDTH, 0],
    outputRange: ["-7deg", "0deg"],
    extrapolate: "clamp",
  })).current;

  const exitCardRotate = useRef(exitX.interpolate({
    inputRange: [-SCREEN_WIDTH, 0],
    outputRange: ["-7deg", "0deg"],
    extrapolate: "clamp",
  })).current;

  const undercardOpacity = useRef(dragX.interpolate({
    inputRange: [-SWIPE_DISTANCE, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  })).current;

  const topCardAnimStyle = {
    transform: [
      { translateX: dragX },
      { rotate: topCardRotate },
    ],
  };

  const exitCardAnimStyle = {
    transform: [
      { translateX: exitX },
      { rotate: exitCardRotate },
    ],
  };

  const handleClose = () => {
    endGame();
    router.back();
  };

  if (!deck) return null;

  const isResultsCard = topIndex === deck.cards.length;
  const topCard: Card | undefined = isResultsCard ? undefined : deck.cards[topIndex];
  const isUndercardResults = undercardDisplayIndex === deck.cards.length;
  const nextCard: Card | undefined = isUndercardResults ? undefined : deck.cards[undercardDisplayIndex];


  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader />

      <View style={styles.cardArea} {...panResponder.panHandlers}>
        {/* Undercard — peeks behind top card while dragging */}
        {isUndercardResults && (
          <Animated.View style={[styles.cardWrapper, { opacity: undercardOpacity }]} pointerEvents="none">
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
          <Animated.View style={[styles.cardWrapper, { opacity: undercardOpacity }]}>
            <View style={[styles.cardFace, { backgroundColor: colors.bgCard }]}>
              <CardFace
                card={nextCard}
                deck={deck}
                cardIndex={undercardDisplayIndex}
                totalCards={deck.cards.length}
                colors={colors}
                styles={styles}
              />
            </View>
          </Animated.View>
        )}

        {/* Top card — sits at rest, draggable */}
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
          ) : topCard ? (
            <View style={[styles.cardFace, { backgroundColor: colors.bgCard }]}>
              <CardFace
                card={topCard}
                deck={deck}
                cardIndex={topIndex}
                totalCards={deck.cards.length}
                colors={colors}
                styles={styles}
              />
            </View>
          ) : null}
        </Animated.View>

        {/* Exit card — frozen content flying off, rendered on top */}
        {exitCardIndex !== null && (
          <Animated.View style={[styles.cardWrapper, exitCardAnimStyle]} pointerEvents="none">
            <View style={[styles.cardFace, { backgroundColor: colors.bgCard }]}>
              {exitCardIndex === deck.cards.length ? (
                <EndCard
                  variant={isPremium ? 'completion' : 'paywall'}
                  onUnlock={() => {}}
                  onReplay={() => {}}
                  onHome={() => {}}
                  colors={colors}
                />
              ) : (
                <CardFace
                  card={deck.cards[exitCardIndex]}
                  deck={deck}
                  cardIndex={exitCardIndex}
                  totalCards={deck.cards.length}
                  colors={colors}
                  styles={styles}
                />
              )}
            </View>
          </Animated.View>
        )}
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
