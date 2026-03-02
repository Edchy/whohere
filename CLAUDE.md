# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project

**whohere** — A question card app for spontaneous social conversations. Play solo, with a partner, or in a group. No internet required.

Built with **React Native + Expo (managed workflow)** and **TypeScript**.

## Stack

- **Framework:** Expo (managed) + expo-router (file-based routing)
- **Language:** TypeScript
- **State:** Zustand (`src/store/`)
- **Styling:** React Native StyleSheet + theme constants (`src/constants/theme.ts`)
- **Data:** Local JSON (`assets/data/decks.json`) — no backend
- **Haptics:** expo-haptics
- **Animation:** react-native-reanimated (to be added for card flip)
- **Storage:** @react-native-async-storage/async-storage (for future settings/progress persistence)

## Build & Run

```bash
npm install
npx expo start       # starts dev server
# then press:
#   i  → iOS Simulator
#   a  → Android emulator
#   scan QR → Expo Go on phone
```

Requires Node 18+. Xcode needed for iOS Simulator or App Store builds.

## Architecture

```
app/                  # expo-router routes = screens
  _layout.tsx         # root layout (stack config, status bar)
  index.tsx           # home screen (mode picker + deck list)
  play/
    [deckId].tsx      # active play screen
    results.tsx       # end-of-deck screen

src/
  components/         # reusable UI components (pure, no store access)
  store/              # Zustand stores (gameStore.ts)
  hooks/              # custom hooks (useHaptics, etc.)
  constants/          # theme.ts — colors, spacing, typography, radius
  types/              # TypeScript types (Deck, Card, DeckMode, etc.)

assets/
  data/decks.json     # all question decks + cards
  images/, fonts/     # static assets
```

## Key Conventions

- All colors, spacing, font sizes come from `src/constants/theme.ts` — never hardcode values
- Components in `src/components/` are purely presentational — no store access, only props
- Screens in `app/` can access Zustand store directly
- Card data lives in `assets/data/decks.json` — edit there to add/change questions
- Navigation uses `expo-router`: `router.push('/play/deck-id')`, `router.back()`, `router.replace('/path')`

## Adding a New Deck

Edit `assets/data/decks.json` and add a new object following the existing schema:
```json
{
  "id": "unique-id",
  "title": "Deck Title",
  "description": "Short description",
  "mode": "solo | partner | group | any",
  "category": "fun | deep | spicy | reflective",
  "cardCount": 10,
  "color": "#HEX",
  "icon": "emoji",
  "cards": [{ "id": "x-1", "question": "...", "difficulty": 1 }]
}
```

## Tests

No test infrastructure yet. Tests directory can be added when needed.
