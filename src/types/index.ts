export type CardDifficulty = 1 | 2 | 3;
export type DeckMode = 'solo' | 'partner' | 'group' | 'any';
export type DeckCategory = 'fun' | 'deep' | 'spicy' | 'reflective';

export type Card = {
  id: string;
  question: string;
  followUp?: string;
  difficulty: CardDifficulty;
};

export type Deck = {
  id: string;
  title: string;
  description: string;
  mode: DeckMode;
  category: DeckCategory;
  cardCount: number;
  color: string;
  icon: string;
  cards: Card[];
};
