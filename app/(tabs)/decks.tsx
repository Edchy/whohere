import { useRouter } from 'expo-router';
import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import ScreenLayout from '../../src/components/ScreenLayout';
import { colors, radius, spacing } from '../../src/constants/theme';
import { useGameStore } from '../../src/store/gameStore';
import { Deck } from '../../src/types';
import allDecks from '../../assets/data/decks/index';

function DeckRow({ deck, isLast }: { deck: Deck; isLast: boolean }) {
  const router = useRouter();
  const startGame = useGameStore((s) => s.startGame);
  const opacity = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.timing(opacity, {
      toValue: 0.75,
      duration: 60,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    startGame(deck, deck.mode);
    router.push(`/play/${deck.id}`);
  };

  return (
    <Animated.View style={{ opacity }}>
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={handlePress}
        style={[styles.row, !isLast && styles.rowGap]}
      >
        <View style={styles.rowInner}>
          <View style={styles.colIcon}>
            <Text style={styles.rowIcon}>{deck.icon}</Text>
          </View>
          <View style={styles.colContent}>
            <Text style={styles.rowLabel}>{deck.title}</Text>
            <Text style={styles.rowDesc} numberOfLines={2}>{deck.description}</Text>
          </View>
          <View style={styles.colMeta}>
            <Text style={styles.rowCount}>{deck.cards.length}</Text>
            <Text style={styles.rowCountLabel}>kort</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function DecksScreen() {
  return (
    <ScreenLayout>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.list}>
          {allDecks.map((deck, index) => (
            <DeckRow
              key={deck.id}
              deck={deck}
              isLast={index === allDecks.length - 1}
            />
          ))}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  list: {
    gap: spacing.sm,
  },
  row: {
    backgroundColor: colors.accent,
    height: 80,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    justifyContent: 'center',
  },
  rowGap: {},
  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colIcon: {
    width: '12%',
    alignItems: 'center',
  },
  colContent: {
    width: '76%',
    paddingHorizontal: spacing.sm,
    gap: 2,
  },
  colMeta: {
    width: '12%',
    alignItems: 'flex-start',
  },
  rowIcon: {
    fontSize: 28,
    color: colors.background,
    opacity: 0.75,
  },
  rowLabel: {
    fontFamily: 'Supreme-Extrabold',
    fontSize: 18,
    lineHeight: 22,
    letterSpacing: -0.3,
    color: colors.background,
  },
  rowDesc: {
    fontSize: 12,
    fontWeight: '400',
    fontStyle: 'italic',
    color: colors.background,
    opacity: 0.75,
    flexShrink: 1,
  },
  rowCount: {
    fontSize: 20,
    fontWeight: '300',
    letterSpacing: -0.5,
    color: colors.background,
    opacity: 0.6,
    textAlign: 'left',
  },
  rowCountLabel: {
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.background,
    opacity: 0.5,
    textAlign: 'left',
  },
});
