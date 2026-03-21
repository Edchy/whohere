import { Card, Deck } from "../../../src/types";

import livssituationerMeta from "./livssituationer.json";
import livssituationerCards from "../cards/livssituationer.cards.json";

import personlighetMeta from "./personlighet.json";
import personlighetCards from "../cards/personlighet.cards.json";

import livBakgrundMeta from "./liv-bakgrund.json";
import livBakgrundCards from "../cards/liv-bakgrund.cards.json";

import relationerKanslorMeta from "./relationer-kanslor.json";
import relationerKanslorCards from "../cards/relationer-kanslor.cards.json";

import hemligheterHistorierMeta from "./hemligheter-historier.json";
import hemligheterHistorierCards from "../cards/hemligheter-historier.cards.json";

import absurtOvantatMeta from "./absurt-ovantat.json";
import absurtOvantatCards from "../cards/absurt-ovantat.cards.json";

import ambitionerDrommarMeta from "./ambitioner-drommar.json";
import ambitionerDrommarCards from "../cards/ambitioner-drommar.cards.json";

import kroppHalsaMeta from "./kropp-halsa.json";
import kroppHalsaCards from "../cards/kropp-halsa.cards.json";

import pengarPrioriMeta from "./pengar-prioriteringar.json";
import pengarPrioriCards from "../cards/pengar-prioriteringar.cards.json";

import radslaModMeta from "./radsla-mod.json";
import radslaModCards from "../cards/radsla-mod.cards.json";

import vanorVardagslivMeta from "./vanor-vardagsliv.json";
import vanorVardagslivCards from "../cards/vanor-vardagsliv.cards.json";

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
  assemble(hemligheterHistorierMeta as Omit<Deck, "cards">, hemligheterHistorierCards as Card[]),
  assemble(absurtOvantatMeta as Omit<Deck, "cards">, absurtOvantatCards as Card[]),
  assemble(ambitionerDrommarMeta as Omit<Deck, "cards">, ambitionerDrommarCards as Card[]),
  assemble(kroppHalsaMeta as Omit<Deck, "cards">, kroppHalsaCards as Card[]),
  assemble(pengarPrioriMeta as Omit<Deck, "cards">, pengarPrioriCards as Card[]),
  assemble(radslaModMeta as Omit<Deck, "cards">, radslaModCards as Card[]),
  assemble(vanorVardagslivMeta as Omit<Deck, "cards">, vanorVardagslivCards as Card[]),
];

export default allDecks;
