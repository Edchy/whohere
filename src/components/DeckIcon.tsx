import React from 'react';
import { Text, View, ViewStyle } from 'react-native';
import deckIcons from '../constants/deckIcons';
import { useColors } from '../hooks/useColors';
import { Deck } from '../types';

type Props = {
  deck: Pick<Deck, 'icon' | 'svgIcon'>;
  size?: number;
  color?: string;
  style?: ViewStyle;
};

export function DeckIcon({ deck, size = 24, color, style }: Props) {
  const colors = useColors();
  const fill = color ?? colors.textPrimary;
  if (deck.svgIcon && deckIcons[deck.svgIcon]) {
    return <View style={style}>{React.createElement(deckIcons[deck.svgIcon], { width: size, height: size, fill })}</View>;
  }
  return <Text style={[{ color: fill }, style as any]}>{deck.icon}</Text>;
}
