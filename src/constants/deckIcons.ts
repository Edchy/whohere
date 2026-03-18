// deckIcons.ts
// Maps svgIcon keys to SVG icon components.
// Any deck without an entry here falls back to deck.icon (emoji string).
import React from 'react';
import { SvgProps } from 'react-native-svg';

import Doodle7389183 from '../../assets/icons/noun-doodle-element-7389183.svg';
import Doodle7389184 from '../../assets/icons/noun-doodle-element-7389184.svg';
import Doodle7389188 from '../../assets/icons/noun-doodle-element-7389188.svg';
import Doodle7389193 from '../../assets/icons/noun-doodle-element-7389193.svg';
import Gift8020579 from '../../assets/icons/noun-gift-8020579.svg';
import Give8020580 from '../../assets/icons/noun-give-8020580.svg';
import Piece8020583 from '../../assets/icons/noun-piece-8020583.svg';

type SvgComponent = React.FC<SvgProps>;

// Keys match the `svgIcon` field in the deck JSON (filename without extension)
const deckIcons: Record<string, SvgComponent> = {
  'noun-doodle-element-7389183': Doodle7389183,
  'noun-doodle-element-7389184': Doodle7389184,
  'noun-doodle-element-7389188': Doodle7389188,
  'noun-doodle-element-7389193': Doodle7389193,
  'noun-gift-8020579': Gift8020579,
  'noun-give-8020580': Give8020580,
  'noun-piece-8020583': Piece8020583,
};

export default deckIcons;
