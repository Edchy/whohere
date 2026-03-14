---
name: project_stack
description: SDK versions, installed libraries, and key configuration facts for whohere
type: project
---

## Expo & React Native
- Expo SDK ~54.0.33, React Native 0.81.5, React 19.1.0
- expo-router ^6.0.23, TypeScript ~5.9.2
- newArchEnabled: true

## Libraries
- react-native-reanimated ^4.1.1 (v4 — uses worklets, not runOnJS for cross-thread calls)
- react-native-worklets ^0.5.1
- zustand ^5.0.11
- expo-haptics ^15.0.8
- @react-native-async-storage/async-storage ^2.2.0
- react-native-gesture-handler ^2.28.0
- react-native-safe-area-context ^5.6.0
- react-native-screens ~4.16.0
- react-native-svg ^15.15.3 (installed via `npm install react-native-svg`)
- react-native-svg-transformer ^1.5.3 (devDep, installed with `--legacy-peer-deps`)

## SVG Setup (completed)
- `metro.config.js` at project root using `expo/metro-config` + transformer path `react-native-svg-transformer/expo`
- TypeScript declaration at `src/types/svg.d.ts`
- Icon map at `src/constants/deckIcons.ts` — maps deck ID → SVG React component
- `DeckCard.tsx` uses icon map, falls back to emoji string if no SVG mapped
- Test: `livssituationer` deck → `assets/icons/noun-zombie-3571880.svg`

## npm Install Notes
- Use `--legacy-peer-deps` for devDeps: react-dom peer conflict (react@19.1.0 vs 19.2.4 expected by radix-ui transitive)
- No app.json plugin needed for react-native-svg in managed workflow (SDK 54)

## Data Architecture
- Deck meta + cards split across `assets/data/decks/*.json` + `assets/data/cards/*.cards.json`
- Assembled in `assets/data/decks/index.ts`
- Deck IDs: livssituationer, personlighet, liv-bakgrund, relationer-kanslor

**Why:** Reference for library compatibility checks and `expo install` version pinning.
**How to apply:** When adding a new library, verify SDK 54 compatibility. When touching reanimated, remember it's v4.
