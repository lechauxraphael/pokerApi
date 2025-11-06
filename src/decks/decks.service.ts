import { Injectable } from '@nestjs/common';

@Injectable()
export class DecksService {
    private suits = ['♠️', '♥️', '♦️', '♣️'];
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
}