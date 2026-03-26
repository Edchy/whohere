import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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
      backgroundColor: colors.fog ?? "#F2EEE9",
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      marginTop: 20,
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
            ...{card.question.toUpperCase()}
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

  const goNext = () => {
    if (!deck) return;
    hapticsRef.current.light();
    nextCardStore();
    setCardIndex((i) => i + 1);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderRelease: (_, g) => {
        if (g.dx < -SWIPE_DISTANCE || g.vx < -(SWIPE_VELOCITY / 1000)) {
          goNext();
        }
      },
    })
  ).current;

  const handleClose = () => {
    endGame();
    router.back();
  };

  if (!deck) return null;

  const isResultsCard = cardIndex >= deck.cards.length;
  const card: Card | undefined = isResultsCard ? undefined : deck.cards[cardIndex];

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader />

      <View style={styles.cardArea} {...panResponder.panHandlers}>
        <View style={styles.cardFace}>
          {isResultsCard ? (
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
              cardIndex={cardIndex}
              totalCards={deck.cards.length}
              colors={colors}
              styles={styles}
            />
          ) : null}
        </View>
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
