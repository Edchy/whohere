import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { DeckIcon } from '../../src/components/DeckIcon';
import ModalLayout from '../../src/components/ModalLayout';
import LockSvg from '../../assets/icons/noun-lock-826098.svg';
import { fonts, radius, spacing } from '../../src/constants/theme';
import { useColors } from '../../src/hooks/useColors';
import { usePurchase } from '../../src/hooks/usePurchase';
import allDecks from '../../assets/data/decks/index';

const MODE_LABELS: Record<string, string> = {
  solo: 'Solo',
  partner: 'Date',
  group: 'Friends',
};

const FREE_PREVIEW_COUNT = 3;
const LOCKED_PREVIEW_COUNT = 2;

export default function DeckDetailScreen() {
  const { deckId } = useLocalSearchParams<{ deckId: string }>();
  const colors = useColors();
  const { isPremium, purchasePremium } = usePurchase();

  const deck = allDecks.find((d) => d.id === deckId);
  if (!deck) return null;

  const isLocked = !isPremium && !deck.free;
  const previewCount = isLocked ? LOCKED_PREVIEW_COUNT : FREE_PREVIEW_COUNT;
  const previewCards = deck.cards.slice(0, previewCount);

  return (
    <ModalLayout>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Deck info */}
        <View style={styles.deckInfo}>
          <DeckIcon deck={deck} size={48} />
          <View style={styles.deckMeta}>
            <Text style={[styles.deckTitle, { color: colors.textPrimary }]}>
              {deck.title.toUpperCase()}
            </Text>
            <Text style={[styles.deckDesc, { color: colors.textSecondary }]}>
              {deck.description}
            </Text>
          </View>
        </View>

        {/* Tags row */}
        <View style={styles.tagsRow}>
          {deck.mode.map((m) => (
            <View key={m} style={[styles.tag, { borderColor: colors.border }]}>
              <Text style={[styles.tagText, { color: colors.textMuted }]}>{MODE_LABELS[m]}</Text>
            </View>
          ))}
          <View style={[styles.tag, { borderColor: colors.border }]}>
            <Text style={[styles.tagText, { color: colors.textMuted }]}>{deck.cards.length} kort</Text>
          </View>
          {isLocked && (
            <View style={[styles.tag, { borderColor: colors.accent + '60', backgroundColor: colors.accent + '12', flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
              <LockSvg width={14} height={14} fill={colors.accent} />
              <Text style={[styles.tagText, { color: colors.accent }]}>Premium</Text>
            </View>
          )}
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Question previews */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>FRÅN KORTLEKEN</Text>

        <View style={styles.questions}>
          {previewCards.map((card) => (
            <View key={card.id} style={[styles.questionCard, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
              <Text style={[styles.prefix, { color: colors.accent }]}>Vem här…</Text>
              <Text style={[styles.questionText, { color: colors.textPrimary }]}>{card.question}</Text>
            </View>
          ))}

          {/* Blurred remaining cards for locked decks */}
          {isLocked && (
            <View style={styles.lockedBlock}>
              {/* Ghost cards behind blur */}
              {deck.cards.slice(LOCKED_PREVIEW_COUNT, LOCKED_PREVIEW_COUNT + 2).map((card) => (
                <View key={card.id} style={[styles.questionCard, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
                  <Text style={[styles.prefix, { color: colors.accent }]}>Vem här…</Text>
                  <Text style={[styles.questionText, { color: colors.textPrimary }]}>{card.question}</Text>
                </View>
              ))}
              {/* Blur overlay */}
              <View style={StyleSheet.absoluteFillObject}>
                {Platform.OS !== 'web' ? (
                  <BlurView style={StyleSheet.absoluteFillObject} intensity={18} tint="dark" />
                ) : null}
                <LinearGradient
                  colors={['transparent', colors.bgPrimary + 'E0', colors.bgPrimary]}
                  style={StyleSheet.absoluteFillObject}
                />
              </View>
              {/* CTA */}
              <View style={styles.lockedCta}>
                <Text style={[styles.lockedCtaText, { color: colors.textSecondary }]}>
                  {deck.cards.length - LOCKED_PREVIEW_COUNT} kort till i den här kortleken
                </Text>
                <Pressable style={[styles.unlockBtn, { backgroundColor: colors.accent }]} onPress={purchasePremium}>
                  <Text style={[styles.unlockBtnText, { color: colors.bgPrimary }]}>Lås upp allt — 69 kr</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Fade hint for free decks */}
          {!isLocked && deck.cards.length > FREE_PREVIEW_COUNT && (
            <Text style={[styles.moreHint, { color: colors.textMuted }]}>
              + {deck.cards.length - FREE_PREVIEW_COUNT} fler frågor — spela för att se dem
            </Text>
          )}
        </View>
      </ScrollView>
    </ModalLayout>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  deckInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  deckMeta: {
    flex: 1,
    gap: spacing.xs,
  },
  deckTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  deckDesc: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tag: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  tagText: {
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    marginVertical: spacing.xs,
  },
  sectionLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  questions: {
    gap: spacing.sm,
  },
  questionCard: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  prefix: {
    fontFamily: fonts.bold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  questionText: {
    fontFamily: fonts.extraLight,
    fontSize: 18,
    lineHeight: 24,
  },
  lockedBlock: {
    gap: spacing.sm,
    position: 'relative',
    minHeight: 160,
  },
  lockedCta: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  lockedCtaText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  unlockBtn: {
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  unlockBtnText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    letterSpacing: 0.5,
  },
  moreHint: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
});
