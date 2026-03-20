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
import MagicCards7798217 from '../../assets/icons/noun-magic-cards-7798217.svg';
import CatHiding7798136 from '../../assets/icons/noun-cat-hiding-7798136.svg';
import SmokingCigarette7798098 from '../../assets/icons/noun-smoking-cigarette-7798098.svg';
import Emoticon6043202 from '../../assets/icons/noun-emoticon-6043202.svg';
import SpookyCharacter7678320 from '../../assets/icons/noun-spooky-character-7678320.svg';
import Wine5575559 from '../../assets/icons/noun-wine-5575559.svg';
import WineBottles1047714 from '../../assets/icons/noun-wine-bottles-1047714.svg';
import Wine1064743 from '../../assets/icons/noun-wine-1064743.svg';
import Wine3811155 from '../../assets/icons/noun-wine-3811155.svg';
import WineGlass1047711 from '../../assets/icons/noun-wine-glass-1047711.svg';

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
  'noun-magic-cards-7798217': MagicCards7798217,
  'noun-cat-hiding-7798136': CatHiding7798136,
  'noun-smoking-cigarette-7798098': SmokingCigarette7798098,
  'noun-emoticon-6043202': Emoticon6043202,
  'noun-spooky-character-7678320': SpookyCharacter7678320,
  'noun-wine-5575559': Wine5575559,
  'noun-wine-bottles-1047714': WineBottles1047714,
  'noun-wine-1064743': Wine1064743,
  'noun-wine-3811155': Wine3811155,
  'noun-wine-glass-1047711': WineGlass1047711,
};

export default deckIcons;
