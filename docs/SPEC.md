# SPEC.md — whohere

## What is whohere?

A **question card app** for spontaneous social play. Works in three modes:
- **Solo** — reflect on yourself with prompts
- **Partner / first date** — two people take turns with deep or fun questions
- **Group** — friends sitting together (train, bar, park) play through a shared deck

No accounts. No internet required. Just the app and people around you.

---

## Tech Stack

### Framework: Expo (Managed Workflow)
- **Why Expo over plain React Native?**
  - Zero Xcode/Android Studio config to get started
  - `expo-router` for file-based navigation (like Next.js)
  - OTA updates later if needed
  - Easy build/submit to App Store via EAS Build
- **You still need Xcode** installed to run on a real iOS device or submit to the App Store — but for day-to-day dev you just use the **Expo Go** app on your phone or an iOS Simulator

### Language: TypeScript
- Type safety, better autocomplete, catches bugs early
- Standard for all modern React Native projects

### Navigation: expo-router (file-based)
- Routes live in `app/` — the file path = the URL/route
- Stack, tab, and modal navigators built in

### State: Zustand
- Lightweight global state (current deck, current card index, mode, score)
- Much simpler than Redux for this use case

### Styling: StyleSheet (built-in) + custom theme file
- No extra library needed
- One `theme.ts` with colors, spacing, typography so the whole app stays consistent

### Data / Content: Local JSON
- Card decks stored as JSON files in `assets/data/`
- No database or API needed — all offline
- Easy to add/edit decks without touching app logic

### Storage: expo-secure-store or AsyncStorage
- Save favorites, completed decks, or settings locally on device
- `AsyncStorage` for non-sensitive data (deck progress, settings)

### Haptics: expo-haptics
- Light taps when flipping cards — makes it feel tactile and satisfying

### Animations: react-native-reanimated
- Smooth card flip animation (3D rotation)
- Swipe-to-next gesture support

---

## Screens & Navigation

```
app/
├── (tabs)/
│   ├── index.tsx          # Home — pick a mode (Solo / Partner / Group)
│   ├── decks.tsx          # Browse all card decks
│   └── settings.tsx       # Language, haptics, theme toggle (dark/light)
├── play/
│   ├── [deckId].tsx       # Active game screen — shows current card, progress
│   └── results.tsx        # End screen — "You finished the deck!" + replay option
└── _layout.tsx            # Root layout (tab bar, stack config)
```

---

## Data Model

### Deck
```ts
type Deck = {
  id: string;
  title: string;          // e.g. "First Date", "Deep Friends", "Solo Reflection"
  description: string;
  mode: "solo" | "partner" | "group" | "any";
  category: "fun" | "deep" | "spicy" | "reflective";
  cardCount: number;
  color: string;          // accent color for the deck card UI
  icon: string;           // emoji or icon name
  cards: Card[];
}
```

### Card
```ts
type Card = {
  id: string;
  question: string;       // e.g. "What's something you've never told anyone?"
  followUp?: string;      // optional: "Why not?"
  difficulty: 1 | 2 | 3; // easy / medium / deep
}
```

---

## Folder Structure

```
project/
├── app/                        # expo-router routes (screens)
│   ├── (tabs)/
│   │   ├── index.tsx           # Home screen
│   │   ├── decks.tsx           # Deck browser
│   │   └── settings.tsx        # Settings
│   ├── play/
│   │   ├── [deckId].tsx        # Active play screen
│   │   └── results.tsx         # Results/end screen
│   └── _layout.tsx             # Root layout
├── assets/
│   ├── data/
│   │   └── decks.json          # All question decks + cards
│   ├── fonts/                  # Custom fonts if any
│   └── images/                 # Illustrations, icons
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── CardFlip.tsx        # Animated card component
│   │   ├── DeckCard.tsx        # Deck preview tile
│   │   ├── ModeSelector.tsx    # Solo/Partner/Group picker
│   │   └── ProgressBar.tsx     # Card progress indicator
│   ├── store/
│   │   └── gameStore.ts        # Zustand store — game state
│   ├── hooks/
│   │   └── useHaptics.ts       # Haptic feedback hook
│   ├── constants/
│   │   └── theme.ts            # Colors, spacing, typography
│   └── types/
│       └── index.ts            # TypeScript types (Deck, Card, etc.)
├── SPEC.md                     # This file
├── CLAUDE.md                   # AI assistant instructions
├── app.json                    # Expo config
├── tsconfig.json
└── package.json
```

---

## Dependencies

### Core
| Package | Purpose |
|---|---|
| `expo` | Core Expo SDK |
| `expo-router` | File-based navigation |
| `react-native-reanimated` | Card flip animations |
| `react-native-gesture-handler` | Swipe gestures |
| `zustand` | Global state management |
| `expo-haptics` | Tactile feedback |
| `@react-native-async-storage/async-storage` | Local persistence |

### Dev
| Package | Purpose |
|---|---|
| `typescript` | Type safety |
| `@types/react` | React types |
| `eslint` + `prettier` | Code quality |

---

## Getting Started (Dev Setup)

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli` (or use `npx expo`)
- **iOS:** Xcode installed (for Simulator) or Expo Go app on iPhone
- **Android:** Android Studio (optional) or Expo Go on Android

### Run the app
```bash
cd project
npm install
npx expo start
```

Then:
- Press `i` to open in iOS Simulator
- Press `a` for Android emulator
- Scan QR code with **Expo Go** on your phone

### Build for App Store (later)
```bash
npm install -g eas-cli
eas build --platform ios
eas submit --platform ios
```

---

## Phases

### Phase 1 — MVP (now)
- [ ] Expo + expo-router scaffolding
- [ ] Home screen with mode selector
- [ ] Hardcoded deck in JSON
- [ ] Play screen with card flip animation
- [ ] Results screen

### Phase 2 — Polish
- [ ] Multiple decks (First Date, Deep Friends, Party, Solo)
- [ ] Dark mode
- [ ] Haptics
- [ ] Settings screen

### Phase 3 — Growth (optional)
- [ ] Multilingual support (Swedish + English to start)
- [ ] User-created decks
- [ ] Share a card as image
- [ ] Backend (Supabase) for community-submitted questions
