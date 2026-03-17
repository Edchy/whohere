// deckIcons.ts
// Maps deck IDs to SVG icon components.
// Any deck without an entry here falls back to deck.icon (emoji string).
import React from 'react';
import { SvgProps } from 'react-native-svg';

import ZombieSvg from '../../assets/icons/noun-zombie-3571880.svg';
import ZombieSvg2 from '../../assets/icons/noun-zombie-3571797.svg';
import RandomSvg from '../../assets/icons/noun-random-2986670.svg';

type SvgComponent = React.FC<SvgProps>;

// Keys match the `svgIcon` field in the deck JSON (filename without extension)
const deckIcons: Record<string, SvgComponent> = {
  'noun-zombie-3571880': ZombieSvg,
  'noun-zombie-3571797': ZombieSvg2,
  'noun-random-2986670': RandomSvg,
};

export default deckIcons;
