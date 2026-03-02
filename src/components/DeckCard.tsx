import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing, typography } from '../constants/theme';
import { Deck } from '../types';

type Props = {
  deck: Deck;
  onPress: () => void;
};

export function DeckCard({ deck, onPress }: Props) {
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: deck.color + '22', borderColor: deck.color + '44' }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.icon}>{deck.icon}</Text>
      <View style={styles.content}>
        <Text style={styles.title}>{deck.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {deck.description}
        </Text>
        <View style={styles.meta}>
          <View style={[styles.badge, { backgroundColor: deck.color + '33' }]}>
            <Text style={[styles.badgeText, { color: deck.color }]}>{deck.mode}</Text>
          </View>
          <Text style={styles.count}>{deck.cardCount} cards</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  icon: {
    fontSize: 32,
    marginRight: spacing.md,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  badgeText: {
    ...typography.label,
    textTransform: 'uppercase',
  },
  count: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
