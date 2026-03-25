# Game Logic — whohere

## Overview

The game is a question card experience. A player selects a mode, picks decks (or lets the app randomize), and swipes through cards one by one. No scoring, no timers — just the questions.

---

## Modes

Three modes: **partner**, **group**, **solo**. Selected on the home screen before entering the deck selection modal (`app/play/categories.tsx`).

Mode currently does one thing:
1. **Determines the default deck pool** — which decks are eligible for "Överraska mig" (Surprise Me)

Mode does **not** filter cards by intensity (the intensity system described in earlier versions has been removed). Mode does not affect play screen UI.

---

## Deck Selection (`app/play/categories.tsx`)

After choosing a mode, the user lands on the categories modal. Here they can:

- **Select one or more decks manually** — cards from all selected decks are merged and shuffled
- **Tap "Överraska mig"** — uses all decks from the mode's default pool (see below)

On start, `buildDeck()` assembles a virtual curated deck from the selected deck IDs, the active mode, and the user's premium status.

### Default deck pools per mode (used for Surprise Me)

```
partner: decks where mode includes "partner"
group:   decks where mode includes "group"
solo:    decks where mode includes "solo"
```

Filtered from `allDecks` at runtime: `allDecks.filter(d => d.mode.includes(mode))`.

### Manual selection

All decks (`allDecks`) are shown regardless of mode. Non-free decks show a lock if the user is not premium — tapping a locked deck triggers the purchase flow.

---

## "Överraska mig" (Surprise Me)

Uses **all eligible decks** for the current mode (premium: all mode decks; free: only free mode decks). Passes all their IDs into `buildDeck()`. Selected by default when the screen opens.

---

## Premium & Free Card Limits

The session card cap depends on premium status:

- **Free:** 10 cards total
- **Premium:** 15 cards total

Cards are distributed evenly across selected decks:

- 1 deck → all cards (up to cap)
- 2 decks → split evenly, remainder to first deck(s)
- N decks → `floor(cap / N)` per deck, remainder distributed to earlier decks

Non-free decks are locked for free users. Attempting to select a locked deck triggers the purchase flow.

---

## Card Assembly (`buildDeck`)

```
function buildDeck(selectedIds, modeId, isPremium)
```

Steps:
1. For each selected deck, stamp each card with its source deck's metadata (`deckIcon`, `deckSvgIcon`, `deckTitle`) — used for visual attribution.
2. Shuffle the stamped cards per deck, then slice to that deck's quota.
3. Merge all slices and shuffle the combined result.
4. Return a virtual `Deck` object with `id: "curated-{modeId}"`.

There is no intensity filtering.

---

## Play Session

Managed by Zustand store (`src/store/gameStore.ts`).

State:
- `activeDeck` — the assembled curated deck
- `currentCardIndex` — 0-based
- `mode` — DeckMode
- `isFlipped` — whether the current card is showing its back face

Actions:
- `startGame(deck, mode)` — sets active deck, resets index and flip state
- `nextCard()` — increments index (bounded), resets flip
- `prevCard()` — decrements index (bounded), resets flip
- `flipCard()` — toggles `isFlipped`
- `endGame()` — clears active deck

Derived helpers: `currentCard()`, `isLastCard()`, `progress()`.

Navigation: after `startGame`, app navigates to `/play/{deck.id}`. After all cards, an end card is shown inline (no separate results screen).

---

## Card Display (`app/play/[deckId].tsx`)

Cards are stacked — the top card is draggable, the next card is visible underneath.

**Swipe gestures:**
- Swipe left (or fast flick left) → next card
- Swipe right (or fast flick right) → previous card (blocked on first card)
- Tap → flip card (front ↔ back)

**Front face shows:**
- "Vem här…" brand hook (accent color, uppercase)
- Main question (uppercase, fontWeight 300)
- Source deck icon + title (bottom left)
- Card counter, e.g. "3 / 15" (bottom right)

**Back face shows:**
- Optional SVG pattern (based on `cardBackStyle` setting: plain, pattern, bubbles, chevron, polka, tictactoe)
- Source deck icon — corner pips (top-left, bottom-right rotated 180°) + large centered icon

**End card** (shown after the last question card, as part of the same swipe stack):
- `variant="completion"` if premium
- `variant="paywall"` if free — prompts purchase

Swiping left on the end card navigates home (`router.replace("/")`).

A close button (✕) at the bottom ends the game and navigates back.

---

## Settings Persisted

Stored in `AsyncStorage` and reflected in Zustand:

| Key | Default | Description |
|-----|---------|-------------|
| `@whohere/isPremium` | false | Premium unlock status |
| `@whohere/hapticsEnabled` | true | Vibrate on card swipe |
| `@whohere/colorScheme` | dark | Dark / light mode |
| `@whohere/cardBackStyle` | plain | Card back pattern |
| `@whohere/hasSeenOnboarding` | false | Onboarding shown flag |

---

## Known TODOs / Open Questions

- **"Överraska mig" logic** — currently uses all mode decks; may need curation once card pool grows
- **Subtitle copy** on categories screen may need updating to reflect actual behavior
- **Group mode turn order** — not implemented, not planned yet
- **Purchase flow** — currently a stub (AsyncStorage only, no real IAP). `restorePurchases` only works on the same device.
