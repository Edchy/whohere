// deckIcons.ts
// Maps svgIcon keys to SVG icon components.
// Any deck without an entry here falls back to deck.icon (emoji string).
import React from 'react';
import { SvgProps } from 'react-native-svg';

import Pattern8300354 from '../../assets/icons/noun-pattern-8300354.svg';
import Shutter8300343 from '../../assets/icons/noun-shutter-8300343.svg';
import Ornament8300338 from '../../assets/icons/noun-ornament-8300338.svg';
import Doodle197591 from '../../assets/icons/category-icons/noun-doodle-197591.svg';
import Doodle197592 from '../../assets/icons/category-icons/noun-doodle-197592.svg';
import Doodle197593 from '../../assets/icons/category-icons/noun-doodle-197593.svg';
import Doodle197598 from '../../assets/icons/category-icons/noun-doodle-197598.svg';
import Doodle197602 from '../../assets/icons/category-icons/noun-doodle-197602.svg';
import Doodle197605 from '../../assets/icons/category-icons/noun-doodle-197605.svg';
import Doodle197606 from '../../assets/icons/category-icons/noun-doodle-197606.svg';
import Doodle197608 from '../../assets/icons/category-icons/noun-doodle-197608.svg';
import Doodle197620 from '../../assets/icons/category-icons/noun-doodle-197620.svg';
import Doodle197626 from '../../assets/icons/category-icons/noun-doodle-197626.svg';

type SvgComponent = React.FC<SvgProps>;

// Keys match the `svgIcon` field in the deck JSON (filename without extension)
const deckIcons: Record<string, SvgComponent> = {
  // Mode tile icons
  'noun-pattern-8300354': Pattern8300354,
  'noun-shutter-8300343': Shutter8300343,
  'noun-ornament-8300338': Ornament8300338,
  // Deck category icons
  'noun-doodle-197591': Doodle197591,
  'noun-doodle-197592': Doodle197592,
  'noun-doodle-197593': Doodle197593,
  'noun-doodle-197598': Doodle197598,
  'noun-doodle-197602': Doodle197602,
  'noun-doodle-197605': Doodle197605,
  'noun-doodle-197606': Doodle197606,
  'noun-doodle-197608': Doodle197608,
  'noun-doodle-197620': Doodle197620,
  'noun-doodle-197626': Doodle197626,
};

export default deckIcons;
