import { Injectable } from '@nestjs/common';

@Injectable()
export class DecksService {
  private suits = ['♠️ pique', '♥️ coeur', '♦️ carreau', '♣️ trèfle'];
  private values = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  private deck: any[] = []; // <-- deck en mémoire

  constructor() {
    this.deck = this.createDeck(); // initialise le deck au démarrage
  }

  createDeck() {
    const deck = [];
    for (const suit of this.suits) {
      for (const value of this.values) {
        deck.push({ suit, value });
      }
    }
    return deck;
  }

  shuffle(deck: any[]) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  private distributeDeck(deck: any[]) {
    const cards = deck.slice(0, 2); // distribue 2 cartes
    const remainingDeck = deck.slice(2);
    return { cards, remainingDeck };
  }

  distribute(deck?: any[]) {
    const currentDeck = deck && deck.length ? deck : this.deck;

    if (currentDeck.length < 2) {
      throw new Error('Pas assez de cartes dans le deck pour distribuer.');
    }

    const result = this.distributeDeck(currentDeck);
    this.deck = result.remainingDeck; // on garde le reste du deck
    return result;
  }
}