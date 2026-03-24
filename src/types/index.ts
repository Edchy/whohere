export type DeckMode = 'solo' | 'partner' | 'group';
export type DeckCategory = 'livssituationer' | 'personlighet' | 'liv-bakgrund' | 'relationer-kanslor' | 'mixed';
export type PlayMode = 'dating' | 'friends' | 'solo';

export type Card = {
  id: string;
  question: string;
  // Stamped at runtime when card is part of a curated deck
  deckIcon?: string;
  deckSvgIcon?: string;
  deckTitle?: string;
};

export type Deck = {
  id: string;
  title: string;
  description: string;
  mode: DeckMode[];
  category: DeckCategory;
  icon: string;
  svgIcon?: string;
  free?: boolean;
  cards: Card[];
};
