import { Injectable } from '@nestjs/common';

@Injectable()
export class DecksService {
    private suits = ['♠️ pique', '♥️ coeur', '♦️ carreau', '♣️ trèfle'];
    private values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
 
  createDeck() {
    const deck = [];
 
    for (const suit of this.suits) {
      for (const value of this.values) {
        deck.push({ suit, value });
      }
    }
 
    return deck; // renvoie un tableau de 52 objets carte
  }

  shuffle(deck: any[]) {
    // Mélange le deck avec l’algorithme de Fisher-Yates
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  distribute(deck?: any[]) {
    // Si tu veux utiliser le deck passé par le body :
    const currentDeck = deck && deck.length ? deck : this.deck;

    if (currentDeck.length < 2) {
      throw new Error('Pas assez de cartes dans le deck pour distribuer.');
    }

    const result = this.decksService.distribute(currentDeck);
    this.deck = result.remainingDeck; // on garde le reste du deck en mémoire
    return result; // { cards: [...], remainingDeck: [...] }
  }
}
