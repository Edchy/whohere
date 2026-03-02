import { create } from 'zustand';
import { Deck, Card, DeckMode } from '../types';

type GameState = {
  // Active session
  activeDeck: Deck | null;
  currentCardIndex: number;
  mode: DeckMode;
  isFlipped: boolean;

  // Actions
  startGame: (deck: Deck, mode: DeckMode) => void;
  nextCard: () => void;
  prevCard: () => void;
  flipCard: () => void;
  endGame: () => void;

  // Derived helpers
  currentCard: () => Card | null;
  isLastCard: () => boolean;
  progress: () => number;
};

export const useGameStore = create<GameState>((set, get) => ({
  activeDeck: null,
  currentCardIndex: 0,
  mode: 'any',
  isFlipped: false,

  startGame: (deck, mode) =>
    set({ activeDeck: deck, currentCardIndex: 0, mode, isFlipped: false }),

  nextCard: () =>
    set((state) => ({
      currentCardIndex: Math.min(
        state.currentCardIndex + 1,
        (state.activeDeck?.cards.length ?? 1) - 1
      ),
      isFlipped: false,
    })),

  prevCard: () =>
    set((state) => ({
      currentCardIndex: Math.max(state.currentCardIndex - 1, 0),
      isFlipped: false,
    })),

  flipCard: () => set((state) => ({ isFlipped: !state.isFlipped })),

  endGame: () =>
    set({ activeDeck: null, currentCardIndex: 0, isFlipped: false }),

  currentCard: () => {
    const { activeDeck, currentCardIndex } = get();
    return activeDeck?.cards[currentCardIndex] ?? null;
  },

  isLastCard: () => {
    const { activeDeck, currentCardIndex } = get();
    if (!activeDeck) return false;
    return currentCardIndex === activeDeck.cards.length - 1;
  },

  progress: () => {
    const { activeDeck, currentCardIndex } = get();
    if (!activeDeck || activeDeck.cards.length === 0) return 0;
    return (currentCardIndex + 1) / activeDeck.cards.length;
  },
}));
