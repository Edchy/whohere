import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import PlayArrowSvg from "../../assets/icons/noun-arrow-8300346.svg";
import RandomSvg from "../../assets/icons/category-icons/noun-question-8320435.svg";
import { DeckTile } from "../../src/components/DeckTile";
import ModalLayout from "../../src/components/ModalLayout";
import { animation, AppColors, radius, spacing, typography } from "../../src/constants/theme";
import { useColors } from "../../src/hooks/useColors";

import { useGameStore } from "../../src/store/gameStore";
import { usePurchase } from "../../src/hooks/usePurchase";
import { Card, Deck } from "../../src/types";
import allDecks from "../../assets/data/decks/index";


const MODE_LABELS: Record<string, string> = {
  partner: "På date",
  group: "Med vänner",
  solo: "På egen hand",
};

const GAME_CARD_LIMIT = 15;
const FREE_CARD_LIMIT = 10;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(selectedIds: string[], modeId: string, isPremium: boolean): Deck {

  const cardLimit = isPremium ? GAME_CARD_LIMIT : FREE_CARD_LIMIT;
  const deckCount = selectedIds.length;
  const basePerDeck = Math.floor(cardLimit / deckCount);
  const remainder = cardLimit % deckCount;

  const cards: Card[] = shuffle(
    selectedIds.flatMap((deckId, i) => {
      const source = allDecks.find((d) => d.id === deckId);
      if (!source) return [];
      const quota = basePerDeck + (i < remainder ? 1 : 0);
      const stamped = source.cards.map((card) => ({
        ...card,
        deckIcon: source.icon,
        deckSvgIcon: source.svgIcon,
        deckTitle: source.title,
      }));
      return shuffle(stamped).slice(0, quota);
    })
  );

  return {
    id: `curated-${modeId}`,
    title: MODE_LABELS[modeId] ?? "Spela",
    description: "",
    mode: [modeId as any],
    category: "mixed",
    icon: "",
    cards,
  };
}

// ─── Header copy ──────────────────────────────────────────────────────────────

const HEADER_TITLES: Record<string, string[]> = {
  partner: [
    "Vad vill ni lära er om varandra?",
    "Vart vill ni ta samtalet ikväll?",
    "Vad är ni redo att utforska?",
  ],
  group: [
    "Vad ska ni blanda er i ikväll?",
    "Vart tar ni gruppen?",
    "Vad väljer ni att gå in i?",
  ],
  solo: [
    "Vad vill du möta idag?",
    "Vart tar du dig själv?",
    "Vad är du redo att titta på?",
  ],
};

const HEADER_SUBTITLES: Record<string, string[]> = {
  partner: [
    "Välj vad som lockar er, eller låt oss välja.",
    "Plocka det ni vill dyka in i. Eller kasta tärningen.",
    "Era val. Eller slumpens.",
  ],
  group: [
    "Välj vad gruppen orkar med. Eller låt ödet avgöra.",
    "Plocka ihop ert kvällsprogram, eller överlåt det åt slumpen.",
    "Alla väljer, ingen bestämmer. Eller låt oss sköta det.",
  ],
  solo: [
    "Välj vad du vill brottas med. Eller låt slumpen ta rodret.",
    "Dina val, eller överlåt dem till universum.",
    "Plocka det du vill gå in i. Eller låt det komma till dig.",
  ],
};

function pickHeaderTitle(mode: string): string {
  const options = HEADER_TITLES[mode] ?? HEADER_TITLES["partner"];
  return options[Math.floor(Math.random() * options.length)];
}

function pickHeaderSubtitle(mode: string): string {
  const options = HEADER_SUBTITLES[mode] ?? HEADER_SUBTITLES["partner"];
  return options[Math.floor(Math.random() * options.length)];
}

// ─── Surprise tile descriptions ───────────────────────────────────────────────

const SURPRISE_DESCS: Record<string, string[]> = {
  partner: [
    "Ett handplockat urval för er två. Men med ett uns överraskning.",
    "Kurerat för er. Ordningen är slumpens fel.",
    "Rätt frågor för er två, i fel ordning. Med flit.",
  ],
  group: [
    "Utvalda för gruppen. Men ingen vet vad som kommer härnäst.",
    "Kurerat kaos för alla inblandade.",
    "Rätt kortlekar för er. Fel ordning. Med avsikt.",
  ],
  solo: [
    "Handplockat för dig. Ordningen bestämmer sig själv.",
    "Kurerat för en. Överraskningarna ingår.",
    "Rätt frågor för dig, i en ordning bara slumpen känner till.",
  ],
};

function pickSurpriseDesc(mode: string): string {
  const options = SURPRISE_DESCS[mode] ?? SURPRISE_DESCS["partner"];
  return options[Math.floor(Math.random() * options.length)];
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    scroll: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: 160,
      gap: spacing.sm,
    },
    header: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
      gap: 0,
    },
    title: {
      ...typography.heading,
      color: colors.textPrimary,
    },
    subtitle: {
      ...typography.caption,
      color: colors.textMuted,
    },
    tileList: {
      gap: spacing.sm,
    },
    surpriseTile: {
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.bgSecondary,
      backgroundColor: colors.bgSecondary,
    },
    surpriseInner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    surpriseText: {
      flex: 1,
      gap: 0,
    },
    surpriseTitle: {
      ...typography.heading,
    },
    surpriseDesc: {
      ...typography.caption,
    },
    startBtn: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    startBtnDisabled: {
      opacity: 0.3,
    },
  });
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function CategoriesScreen() {
  const colors = useColors();
  const colorScheme = useGameStore((s) => s.colorScheme);
  const styles = makeStyles(colors);

  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode: string }>();
  const startGame = useGameStore((s) => s.startGame);
  const { isPremium, purchasePremium } = usePurchase();
  const surpriseDesc = useRef(pickSurpriseDesc(mode ?? "partner")).current;
  const headerTitle = useRef(pickHeaderTitle(mode ?? "partner")).current;
  const headerSubtitle = useRef(pickHeaderSubtitle(mode ?? "partner")).current;

  const modeDecks = allDecks.filter((d) => d.mode.includes(mode as any)); // used for surprise only
  const visibleDecks = allDecks; // all decks shown for manual selection
  const [selected, setSelected] = useState<string[]>([]);
  const [randomize, setRandomize] = useState(true);

  const surpriseOpacity = useRef(new Animated.Value(1)).current;

  const toggle = (id: string) => {
    if (!isPremium && !allDecks.find((d) => d.id === id)?.free) {
      purchasePremium();
      return;
    }
    setRandomize(false);
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSurpriseToggle = () => {
    setRandomize(true);
    setSelected([]);
  };

  const canStart = randomize || selected.length > 0;

  const handleStart = () => {
    if (!canStart) return;
    const eligibleDecks = isPremium ? modeDecks : modeDecks.filter((d) => d.free);
    const ids = randomize ? eligibleDecks.map((d) => d.id) : selected;
    const deck = buildDeck(ids, mode ?? "partner", isPremium);
    startGame(deck, (mode ?? "partner") as any);
    router.replace(`/play/${deck.id}`);
  };

  const startOpacity = useRef(new Animated.Value(1)).current;
  const onStartPressIn = () =>
    Animated.timing(startOpacity, { toValue: 0.75, duration: animation.press, useNativeDriver: true }).start();
  const onStartPressOut = () =>
    Animated.timing(startOpacity, { toValue: 1, duration: animation.base, useNativeDriver: true }).start();

  return (
    <ModalLayout>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{headerTitle}</Text>
          <Text style={styles.subtitle}>{headerSubtitle}</Text>
        </View>

        <View style={styles.tileList}>
          {/* Surprise tile */}
          <Animated.View style={{ opacity: surpriseOpacity }}>
            <Pressable
              onPressIn={() =>
                Animated.timing(surpriseOpacity, { toValue: 0.75, duration: animation.press, useNativeDriver: true }).start()
              }
              onPressOut={() =>
                Animated.timing(surpriseOpacity, { toValue: 1, duration: animation.base, useNativeDriver: true }).start()
              }
              onPress={handleSurpriseToggle}
              style={[styles.surpriseTile, randomize && { backgroundColor: colors.accent, borderColor: 'transparent' }]}
            >
              <View style={styles.surpriseInner}>
                <View style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}>
                  <RandomSvg width={32} height={32} fill={randomize ? (colorScheme === 'light' ? '#111111' : colors.bgPrimary) : colors.textPrimary} />
                </View>
                <View style={styles.surpriseText}>
                  <Text style={[styles.surpriseTitle, { color: randomize ? (colorScheme === 'light' ? '#111111' : colors.bgPrimary) : colors.textPrimary }]}>
                    ÖVERRASKA MIG!
                  </Text>
                  <Text style={[styles.surpriseDesc, { color: randomize ? (colorScheme === 'light' ? '#44444499' : colors.bgPrimary + '99') : colors.textMuted }]}>
                    {surpriseDesc}
                  </Text>
                </View>
              </View>
            </Pressable>
          </Animated.View>

          {/* Deck tiles */}
          {visibleDecks.map((deck) => (
            <DeckTile
              key={deck.id}
              deck={deck}
              isSelected={selected.includes(deck.id)}
              showCount={false}
              locked={!isPremium && !deck.free}
              onPress={() => toggle(deck.id)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Fade gradient behind floating button */}
      <LinearGradient
        colors={[colors.bgPrimary + '00', colors.bgPrimary + 'EE', colors.bgPrimary]}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 240, pointerEvents: 'none' }}
      />

      {/* Floating start button */}
      <Animated.View style={[{ position: 'absolute', bottom: spacing.xl, alignSelf: 'center' }, { opacity: startOpacity }]}>
        <Pressable
          onPressIn={onStartPressIn}
          onPressOut={onStartPressOut}
          onPress={handleStart}
          disabled={!canStart}
          style={[styles.startBtn, !canStart && styles.startBtnDisabled]}
        >
          <PlayArrowSvg width={24} height={24} fill={colors.textOnBrand} />
        </Pressable>
      </Animated.View>
    </ModalLayout>
  );
}
