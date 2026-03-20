export type DeckMode = 'solo' | 'partner' | 'group' | 'any';
export type DeckCategory = 'livssituationer' | 'personlighet' | 'liv-bakgrund' | 'relationer-kanslor' | 'mixed';
export type PlayMode = 'dating' | 'friends' | 'solo';

export type IntensityAxis = 'bold' | 'daring' | 'sexual' | 'vulnerable' | 'controversial' | 'dark' | 'funny';

export type CardIntensity = {
  bold?:          number;  // 0–5: how bold/confrontational the question is
  daring?:        number;  // 0–5: how daring/risky it feels to answer
  sexual?:        number;  // 0–5: sexual charge (0 = none)
  vulnerable?:    number;  // 0–5: emotional exposure required to answer
  controversial?: number;  // 0–5: divisive/politically charged
  dark?:          number;  // 0–5: heavy, morbid, or bleak themes
  funny?:         number;  // 0–5: comedic or lighthearted premise
};

export type Card = {
  id: string;
  question: string;
  followUp?: string;
  intensity: CardIntensity;
  // Stamped at runtime when card is part of a curated deck
  deckIcon?: string;
  deckSvgIcon?: string;
  deckTitle?: string;
};

export type Deck = {
  id: string;
  title: string;
  description: string;
  mode: DeckMode;
  category: DeckCategory;
  icon: string;
  svgIcon?: string;
  cards: Card[];
};
