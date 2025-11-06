import { Injectable } from '@nestjs/common';
import { DecksService } from 'src/decks/decks.service';

@Injectable()
export class tablesService {
    tables: string[];

    constructor(private readonly decksService: DecksService){
        console.log('Création des tables');
        this.tables = ['Table1', 'Table2', 'Table3'];
    }

    findDeck(){
        return this.decksService.createDeck();
    }

    shuffle(){
        return this.decksService.shuffle(this.decksService.createDeck())
    }
    
    findAll(): string[] {
        return this.tables;
    }
}
