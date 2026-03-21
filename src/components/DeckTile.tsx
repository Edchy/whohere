import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import OkeySvg from '../../assets/icons/noun-okey-8020578.svg';
import { animation, AppColors, radius, spacing, typography } from '../constants/theme';
import { useColors } from '../hooks/useColors';
import { DeckIcon } from './DeckIcon';
import type { Deck } from '../types';

interface Props {
  deck: Deck;
  isSelected?: boolean;
  selectedColor?: string;
  badge?: string;
  showCount?: boolean;
  onPress: () => void;
}

function hexLuminance(hex: string): number {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const toLinear = (c: number) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function contrastText(hex: string): string {
  return hexLuminance(hex) > 0.4 ? '#0D0D0D' : '#F5F0E8';
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    tile: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.bgSecondary,
    },
    inner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    text: {
      flex: 1,
      gap: 0,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    titleRight: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      flexShrink: 0,
      gap: spacing.xs,
    },
    title: {
      ...typography.heading,
      flex: 1,
    },
    desc: {
      ...typography.caption,
    },
    count: {
      ...typography.badge,
    },

  });
}

export function DeckTile({ deck, isSelected = false, selectedColor, badge, showCount = true, onPress }: Props) {
  const colors = useColors();
  const styles = makeStyles(colors);
  const opacity = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.timing(opacity, { toValue: 0.75, duration: animation.press, useNativeDriver: true }).start();

  const onPressOut = () =>
    Animated.timing(opacity, { toValue: 1, duration: animation.base, useNativeDriver: true }).start();

  const activeBg = selectedColor ?? colors.accent;
  const bg = isSelected ? activeBg : colors.bgSecondary;
  const onColor = isSelected ? contrastText(activeBg) : colors.textPrimary;
  const textColor = onColor;
  const subColor = isSelected ? onColor + '99' : colors.textMuted;
  const iconColor = onColor;

  return (
    <Animated.View style={{ opacity }}>
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
        style={[styles.tile, { backgroundColor: bg }, isSelected && { borderColor: 'transparent' }]}
      >
        <View style={styles.inner}>
          <DeckIcon deck={deck} size={24} color={iconColor} />
          <View style={styles.text}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: textColor }]}>{deck.title.toUpperCase()}</Text>
              <View style={styles.titleRight}>
                <OkeySvg width={24} height={24} fill={badge ? (isSelected ? '#000000' : colors.textMuted) : 'transparent'} />
                {showCount && <Text style={[styles.count, { color: subColor }]}>{deck.cards.length} kort</Text>}
              </View>
            </View>
            <Text style={[styles.desc, { color: subColor }]}>{deck.description}</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}
