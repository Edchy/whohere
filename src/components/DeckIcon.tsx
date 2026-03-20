import React from 'react';
import { Text, TextStyle } from 'react-native';
import deckIcons from '../constants/deckIcons';
import { useColors } from '../hooks/useColors';
import { Deck } from '../types';

type Props = {
  deck: Pick<Deck, 'icon' | 'svgIcon'>;
  size?: number;
  color?: string;
  style?: TextStyle;
};

export function DeckIcon({ deck, size = 24, color, style }: Props) {
  const colors = useColors();
  const fill = color ?? colors.textPrimary;
  if (deck.svgIcon && deckIcons[deck.svgIcon]) {
    return React.createElement(deckIcons[deck.svgIcon], { width: size, height: size, fill });
  }
  return <Text style={[style, { color: fill }]}>{deck.icon}</Text>;
}
