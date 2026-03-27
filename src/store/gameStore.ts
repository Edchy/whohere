import { create } from 'zustand';
import { Deck, Card, DeckMode } from '../types';

type GameState = {
  // Active session
  activeDeck: Deck | null;
  currentCardIndex: number;
  mode: DeckMode;

  // Purchase
  isPremium: boolean;
  setIsPremium: (value: boolean) => void;

  // Settings
  hapticsEnabled: boolean;
  setHapticsEnabled: (enabled: boolean) => void;
  colorScheme: 'dark' | 'light';
  setColorScheme: (scheme: 'dark' | 'light') => void;
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (seen: boolean) => void;

  // Actions
  startGame: (deck: Deck, mode: DeckMode) => void;
  nextCard: () => void;
  prevCard: () => void;
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

  isPremium: false,
  setIsPremium: (value) => set({ isPremium: value }),

  hapticsEnabled: true,
  setHapticsEnabled: (enabled) => set({ hapticsEnabled: enabled }),
  colorScheme: 'dark' as const,
  setColorScheme: (scheme) => set({ colorScheme: scheme }),
  hasSeenOnboarding: false,
  setHasSeenOnboarding: (seen) => set({ hasSeenOnboarding: seen }),

  startGame: (deck, mode) =>
    set({ activeDeck: deck, currentCardIndex: 0, mode }),

  nextCard: () =>
    set((state) => ({
      currentCardIndex: Math.min(
        state.currentCardIndex + 1,
        (state.activeDeck?.cards.length ?? 1) - 1
      ),
    })),

  prevCard: () =>
    set((state) => ({
      currentCardIndex: Math.max(state.currentCardIndex - 1, 0),
    })),

  endGame: () =>
    set({ activeDeck: null, currentCardIndex: 0 }),

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
