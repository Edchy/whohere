import React from 'react';
import { Text, TextStyle } from 'react-native';
import deckIcons from '../constants/deckIcons';
import { Deck } from '../types';

type Props = {
  deck: Pick<Deck, 'icon' | 'svgIcon' | 'color'>;
  size?: number;
  color?: string;
  style?: TextStyle;
};

export function DeckIcon({ deck, size = 24, color, style }: Props) {
  const fill = color ?? deck.color;
  if (deck.svgIcon && deckIcons[deck.svgIcon]) {
    return React.createElement(deckIcons[deck.svgIcon], { width: size, height: size, fill });
  }
  return <Text style={[style, { color: fill }]}>{deck.icon}</Text>;
}
