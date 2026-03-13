import { Card, Deck } from "../../../src/types";

import livssituationerMeta from "./livssituationer.json";
import livssituationerCards from "../cards/livssituationer.cards.json";

import personlighetMeta from "./personlighet.json";
import personlighetCards from "../cards/personlighet.cards.json";

import livBakgrundMeta from "./liv-bakgrund.json";
import livBakgrundCards from "../cards/liv-bakgrund.cards.json";

import relationerKanslorMeta from "./relationer-kanslor.json";
import relationerKanslorCards from "../cards/relationer-kanslor.cards.json";

function assemble(meta: Omit<Deck, "cards">, cards: Card[]): Deck {
  return { ...meta, cards } as Deck;
}

// To add a new deck: create my-deck.json + my-deck.cards.json,
// then add one import pair and one assemble() call below.
const allDecks: Deck[] = [
  assemble(livssituationerMeta as Omit<Deck, "cards">, livssituationerCards as Card[]),
  assemble(personlighetMeta as Omit<Deck, "cards">, personlighetCards as Card[]),
  assemble(livBakgrundMeta as Omit<Deck, "cards">, livBakgrundCards as Card[]),
  assemble(relationerKanslorMeta as Omit<Deck, "cards">, relationerKanslorCards as Card[]),
];

export default allDecks;
