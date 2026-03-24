import { create } from 'zustand';
import { Deck, Card, DeckMode } from '../types';

type GameState = {
  // Active session
  activeDeck: Deck | null;
  currentCardIndex: number;
  mode: DeckMode;
  isFlipped: boolean;

  // Purchase
  isPremium: boolean;
  setIsPremium: (value: boolean) => void;

  // Settings
  hapticsEnabled: boolean;
  setHapticsEnabled: (enabled: boolean) => void;
  colorScheme: 'dark' | 'light';
  setColorScheme: (scheme: 'dark' | 'light') => void;
  cardBackStyle: 'plain' | 'pattern' | 'bubbles' | 'chevron' | 'polka' | 'tictactoe';
  setCardBackStyle: (style: 'plain' | 'pattern' | 'bubbles' | 'chevron' | 'polka' | 'tictactoe') => void;
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (seen: boolean) => void;

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
  mode: 'partner',
  isFlipped: false,

  isPremium: false,
  setIsPremium: (value) => set({ isPremium: value }),

  hapticsEnabled: true,
  setHapticsEnabled: (enabled) => set({ hapticsEnabled: enabled }),
  colorScheme: 'dark' as const,
  setColorScheme: (scheme) => set({ colorScheme: scheme }),
  cardBackStyle: 'plain' as const,
  setCardBackStyle: (style) => set({ cardBackStyle: style }),
  hasSeenOnboarding: false,
  setHasSeenOnboarding: (seen) => set({ hasSeenOnboarding: seen }),

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
