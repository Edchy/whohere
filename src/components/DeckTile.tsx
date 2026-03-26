import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useCallback, useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import OkeySvg from '../../assets/icons/noun-okey-8020578.svg';
import LockSvg from '../../assets/icons/noun-lock-826098.svg';
import { animation, AppColors, radius, spacing, typography } from '../constants/theme';
import { useColors } from '../hooks/useColors';

import { useGameStore } from '../store/gameStore';
import { DeckIcon } from './DeckIcon';
import type { Deck } from '../types';

interface Props {
  deck: Deck;
  isSelected?: boolean;
  selectedColor?: string;
  badge?: string;
  showCount?: boolean;
  locked?: boolean;
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
  const lum = hexLuminance(hex);
  return isNaN(lum) || lum > 0.4 ? '#0D0D0D' : '#F5F0E8';
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    tile: {
      overflow: 'hidden',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.accent + '18',
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
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
      alignItems: 'center',
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

export const DeckTile = React.memo(function DeckTile({ deck, isSelected = false, selectedColor, badge, showCount = true, locked = false, onPress }: Props) {
  const colors = useColors();
  const colorScheme = useGameStore((s) => s.colorScheme);
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const opacity = useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() =>
    Animated.timing(opacity, { toValue: 0.75, duration: animation.press, useNativeDriver: true }).start(), []);

  const onPressOut = useCallback(() =>
    Animated.timing(opacity, { toValue: 1, duration: animation.base, useNativeDriver: true }).start(), []);

  const activeBg = selectedColor ?? colors.accent;
  const bg = isSelected ? activeBg : colors.bgSecondary;
  const onColor = isSelected ? contrastText(activeBg) : colors.textPrimary;
  const textColor = onColor;
  const subColor = isSelected ? onColor + '99' : colors.textSecondary;
  const iconColor = isSelected ? onColor : !locked ? (colorScheme === 'light' ? colors.accent : '#e6c8b7') : onColor;

  return (
    <Animated.View style={{ opacity }}>
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
        style={[styles.tile, isSelected && { backgroundColor: bg, borderColor: 'transparent' }]}
      >
        {!isSelected && Platform.OS !== 'web' && colorScheme === 'dark' && (
          <BlurView style={StyleSheet.absoluteFillObject} intensity={20} tint="dark" />
        )}
        {!isSelected && colorScheme === 'light' && (
          <>
            <LinearGradient
              colors={[colors.accent + '15', 'transparent']}
              locations={[0, 0.6]}
              start={{ x: 1, y: 0 }}
              end={{ x: 0.2, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <LinearGradient
              colors={[colors.accent + '15', 'transparent']}
              locations={[0, 0.6]}
              start={{ x: 0, y: 1 }}
              end={{ x: 0.8, y: 0 }}
              style={StyleSheet.absoluteFillObject}
            />
          </>
        )}
        <View style={styles.inner}>
          <DeckIcon deck={deck} size={40} color={iconColor} style={locked ? { opacity: 0.45 } : undefined} />
          <View style={styles.text}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: textColor, opacity: locked ? 0.45 : 1 }]} numberOfLines={1}>{deck.title.toUpperCase()}</Text>
              <View style={styles.titleRight}>
                <OkeySvg width={24} height={24} fill={badge ? (isSelected ? '#000000' : colors.textMuted) : 'transparent'} />
                {locked && (
                  <>
                    <Text style={[styles.count, { color: colors.textMuted }]}>PREMIUM</Text>
                    <LockSvg width={18} height={18} fill={colors.textMuted} />
                  </>
                )}
                {showCount && <Text style={[styles.count, { color: subColor }]}>{deck.cards.length} kort</Text>}
              </View>
            </View>
            <Text style={[styles.desc, { color: subColor, opacity: locked ? 0.45 : 1 }]} numberOfLines={2}>{deck.description}</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
});
