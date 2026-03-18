# Game Logic — whohere

## Overview

The game is a question card experience. A player selects a mode, optionally picks decks, and then swipes through cards one by one. No scoring, no timers — just the questions.

---

## Modes

Three modes: **partner**, **group**, **solo**. Modes are selected on the home screen before entering the deck selection modal.

Currently, mode does two things:
1. **Determines the default deck pool** — which decks are suggested/available for that mode
2. **Filters cards by intensity** — cards outside the mode's intensity ranges are excluded

Modes do NOT currently affect the play screen UI or card format.

---

## Deck Selection (`app/play/categories.tsx`)

After choosing a mode, the user lands on the categories modal. Here they can:

- **Select one or more decks manually** — cards from all selected decks are merged and shuffled
- **Tap "Överraska mig"** — triggers automatic deck selection (see below)

On start, `buildDeck()` assembles a virtual curated deck from the selected deck IDs and the active mode.

### Default deck pools per mode

```
partner: ["relationer-kanslor", "personlighet"]
group:   ["livssituationer", "personlighet"]
solo:    ["liv-bakgrund", "relationer-kanslor"]
```

---

## "Överraska mig" (Surprise Me)

Current behavior: picks a **random subset** of 1–N decks from the mode's default pool using `randomSubset()`, then runs those through `buildDeck()`.

With only 2 decks per mode pool this is not very meaningful — it randomly picks 1 or 2 decks. This is a known placeholder pending a richer card/deck library.

> **TODO:** Revisit once the card pool grows. Options: fixed curated preset per mode, all decks always, or a smarter random.

---

## Intensity Filtering

Each card has up to 7 intensity axes, each scored **0–5**:

| Axis | What it measures |
|------|-----------------|
| `bold` | How confrontational or direct |
| `daring` | How risky or socially daring |
| `sexual` | Sexual charge |
| `vulnerable` | Emotional exposure required |
| `controversial` | Divisive or politically charged |
| `dark` | Heavy, morbid, or bleak themes |
| `funny` | Comedic or lighthearted |

### Filtering rule

- If a card scores **0** on an axis → always passes (0 = not applicable for this card)
- If a card scores **non-zero** → must fall within the mode's `[min, max]` range for that axis
- If it falls outside the range on **any** axis → card is excluded

### Intensity ranges per mode

| Axis | partner | group | solo |
|------|---------|-------|------|
| bold | [1, 4] | [1, 5] | [0, 3] |
| daring | [1, 4] | [1, 5] | [0, 3] |
| sexual | [0, 3] | [0, 1] | [0, 0] |
| vulnerable | [1, 4] | [0, 2] | [2, 5] |
| controversial | [0, 2] | [0, 3] | [1, 4] |
| dark | [0, 2] | [0, 2] | [1, 4] |
| funny | [0, 4] | [1, 5] | [0, 2] |

**Fallback:** If filtering eliminates all cards, all cards are used unfiltered.

### Mode personalities (implied by ranges)

- **partner** — emotionally bold and vulnerable, moderate sexual charge, avoids heavy/dark
- **group** — high energy, funny, socially daring, low sexual/vulnerability, allows some controversy
- **solo** — introspective, dark, vulnerable, no sexual content, no low-effort humor

---

## Card Assembly (`buildDeck`)

A game session is capped at **15 cards total**, distributed evenly across selected decks:

- 1 deck → 15 cards
- 2 decks → 7 + 8 cards
- 3 decks → 5 + 5 + 5 cards
- 4 decks → 3 + 4 + 4 + 4 cards (remainder distributed to earlier decks)

Steps:
1. For each selected deck, filter its cards through `passesIntensityFilter`. Fall back to all cards if filtering eliminates everything.
2. Shuffle the filtered pool per deck, then slice to that deck's quota.
3. Merge all slices and shuffle the combined result.
4. Stamp each card with its source deck's metadata (icon, title, color, cardBackground, cardText) — used for visual attribution in the play screen.
5. Return a virtual `Deck` object with `id: "curated-{mode}"`.

---

## Play Session

Managed by Zustand store (`src/store/gameStore.ts`).

State:
- `activeDeck` — the assembled curated deck
- `currentCardIndex` — 0-based
- `mode` — DeckMode
- `isFlipped` — whether current card is showing back face

Actions:
- `startGame(deck, mode)` — sets active deck, resets index
- `nextCard()` — increments index (bounded)
- `prevCard()` — decrements index (bounded)
- `flipCard()` — toggles `isFlipped`
- `endGame()` — clears active deck

Navigation: after `startGame`, app navigates to `/play/{deck.id}`. On last card swipe, navigates to `/play/results`.

---

## Card Display

Cards show:
- Source deck icon + title (uppercase, top)
- **"Vem här…"**  — the brand hook
- Main question (fontSize 28, fontWeight 300)
- Optional `followUp` question (after a divider, if present)
- Card counter (e.g. "3 / 24")
- Navigation dots (corners — left if not first, right if not last)

Back face (on flip):
- Source deck icon (large)
- Source deck title
- "tryck för att vända" hint

---

## Known TODOs / Open Questions

- **"Överraska mig" logic** needs revisiting once card pool grows
- **Subtitle copy** ("vi blandar ihop resten") is not accurate — we only mix selected decks, not "the rest"
- **Mode UI hints** — not implemented, decided against for now (modes = filtering only)
- **Intensity customization** — decided against for now (trust the mode presets)
- **Group mode turn order** — not implemented, not planned yet
