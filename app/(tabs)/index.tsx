import { useRouter } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, radius } from '../../src/constants/theme';

const MODES = [
  {
    id: 'partner',
    label: 'On a date',
    sublabel: 'Flirty. Curious. Revealing.',
    emoji: '💕',
    color: colors.datingTint,
    deckId: 'dating',
  },
  {
    id: 'group',
    label: 'With friends',
    sublabel: 'Absurd. Funny. A little chaotic.',
    emoji: '👯',
    color: colors.friendsTint,
    deckId: 'friends',
  },
  {
    id: 'solo',
    label: 'Alone',
    sublabel: 'Slow. Observant. Meditative.',
    emoji: '🧍',
    color: colors.soloTint,
    deckId: 'solo',
  },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Wordmark */}
        <View style={styles.header}>
          <Text style={styles.wordmark}>Who here?</Text>
          <Text style={styles.tagline}>A game about how we read people.</Text>
        </View>

        {/* Mode cards */}
        <View style={styles.modes}>
          {MODES.map((mode, i) => (
            <TouchableOpacity
              key={mode.id}
              style={[styles.modeCard, i < MODES.length - 1 && styles.modeCardBorder]}
              onPress={() => router.push(`/play/${mode.deckId}`)}
              activeOpacity={0.6}
            >
              <View style={styles.modeLeft}>
                <Text style={styles.modeEmoji}>{mode.emoji}</Text>
                <View>
                  <Text style={styles.modeLabel}>{mode.label}</Text>
                  <Text style={styles.modeSublabel}>{mode.sublabel}</Text>
                </View>
              </View>
              <Text style={[styles.modeArrow, { color: mode.color }]}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer hint */}
        <Text style={styles.hint}>
          Look around. Pick someone. Discuss why.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    marginBottom: spacing.xxxl,
    marginTop: spacing.xl,
  },
  wordmark: {
    fontSize: 44,
    fontWeight: '300',
    color: colors.accent,
    letterSpacing: -1,
    lineHeight: 52,
    marginBottom: spacing.sm,
  },
  tagline: {
    ...typography.body,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  modes: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.card,
  },
  modeCardBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  modeEmoji: {
    fontSize: 28,
    width: 40,
  },
  modeLabel: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    marginBottom: 2,
    fontSize: 17,
  },
  modeSublabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  modeArrow: {
    fontSize: 20,
    fontWeight: '300',
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    letterSpacing: 0.3,
  },
});
