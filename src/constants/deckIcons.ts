// deckIcons.ts
// Maps svgIcon keys to SVG icon components.
// Any deck without an entry here falls back to deck.icon (emoji string).
import React from 'react';
import { SvgProps } from 'react-native-svg';

import Doodle7389183 from '../../assets/icons/noun-doodle-element-7389183.svg';
import Doodle7389184 from '../../assets/icons/noun-doodle-element-7389184.svg';
import Doodle7389188 from '../../assets/icons/noun-doodle-element-7389188.svg';
import Doodle7389193 from '../../assets/icons/noun-doodle-element-7389193.svg';
import Pattern8300354 from '../../assets/icons/noun-pattern-8300354.svg';
import Shutter8300343 from '../../assets/icons/noun-shutter-8300343.svg';
import Ornament8300338 from '../../assets/icons/noun-ornament-8300338.svg';

type SvgComponent = React.FC<SvgProps>;

// Keys match the `svgIcon` field in the deck JSON (filename without extension)
const deckIcons: Record<string, SvgComponent> = {
  'noun-doodle-element-7389183': Doodle7389183,
  'noun-doodle-element-7389184': Doodle7389184,
  'noun-doodle-element-7389188': Doodle7389188,
  'noun-doodle-element-7389193': Doodle7389193,
  'noun-pattern-8300354': Pattern8300354,
  'noun-shutter-8300343': Shutter8300343,
  'noun-ornament-8300338': Ornament8300338,
};

export default deckIcons;
