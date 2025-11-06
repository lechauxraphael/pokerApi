import { Injectable } from '@nestjs/common';
import { DecksService } from 'src/decks/decks.service';

@Injectable()
export class tablesService {
    tables: string[];
    private deck: any[];

  constructor(private readonly decksService: DecksService) {
        console.log('Création des tables');
        this.tables = ['Table1', 'Table2', 'Table3'];
        this.deck = this.decksService.createDeck();
    }

    findDeck() {
        return this.deck;
    }

    shuffle() {
        this.deck = this.decksService.shuffle(this.deck);
        return this.deck;
    }

    findAll(): string[] {
        return this.tables;
    }

    distribute() {
        const deck = this.decksService.shuffle(this.decksService.createDeck());
        return this.decksService.distribute(deck);
    }
}
