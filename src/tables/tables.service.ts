import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DecksService } from 'src/decks/decks.service';

@Injectable()
export class TablesService {
    private tables: {
        name: string;
        players: {
            userId: number;
            username: string;
            hand?: any[];
            blind?: 'big' | 'small' | 'neutre';
        }[];
        deck: any[];
    }[] = [];

    constructor(private readonly decksService: DecksService) {
        this.tables = [
            {
                name: 'Table1',
                players: [],
                deck: this.decksService.shuffle(this.decksService.createDeck()),
            },
            {
                name: 'Table2',
                players: [],
                deck: this.decksService.shuffle(this.decksService.createDeck()),
            },
            {
                name: 'Table3',
                players: [],
                deck: this.decksService.shuffle(this.decksService.createDeck()),
            },
        ];
    }

    findDeck() {
        return this.tables.map(table => ({
            tableName: table.name,
            remainingCards: table.deck.length,
            deck: table.deck,
        }));
    }

    shuffle() {
    this.tables.forEach(table => {
        table.deck = this.decksService.shuffle(table.deck);
    });

    return {
            message: 'Tous les decks ont été mélangés',
            tables: this.tables.map(t => ({
                tableName: t.name,
                remainingCards: t.deck.length,
            })),
        };
    }

    findAll() {
        return this.tables;
    }

    findTable(name: string) {
        return this.tables.find(t => t.name.toLowerCase() === name.toLowerCase());
    }

    getTableDeck(name: string) {
        const table = this.findTable(name);
        if (!table) throw new NotFoundException('Table non trouvée');
        return table.deck;
    }

    joinTable(name: string, user: { userId: number; username: string }) {
        const table = this.findTable(name);
        if (!table) throw new NotFoundException('Table non trouvée');

        if (!table.players.find(p => p.userId === user.userId)) {
            table.players.push({ ...user, hand: [] });
        }
        return table;
    }

    leaveTable(name: string, userId: number) {
        const table = this.findTable(name);
        if (!table) throw new NotFoundException('Table non trouvée');

        table.players = table.players.filter(p => p.userId !== userId);
        return table;
    }

    distributeHands(tableName: string) {
        const table = this.findTable(tableName);
        if (!table) throw new BadRequestException('Table non trouvée');

        if (table.players.length < 2) {
            throw new BadRequestException('Pas assez de joueurs');
        }

        table.players.forEach(player => {
            player.hand = [
                table.deck.shift(),
                table.deck.shift(),
            ];
        });

        return table.players.map(p => ({
            userId: p.userId,
            username: p.username,
            hand: p.hand,
        }));
    }

    // 🔥 BURN
    burnCard(tableName: string) {
        const table = this.findTable(tableName);
        if (!table) throw new NotFoundException('Table non trouvée');

        return this.decksService.burn(table.deck);
    }

    // 🎯 GET CARD (interne)
    getCardById(tableName: string, id: number) {
        const table = this.findTable(tableName);
        if (!table) throw new NotFoundException('Table non trouvée');

        return this.decksService.getCardById(table.deck, id);
    }

    setBlind(
    tableName: string,
    userId: number,
    type: 'big' | 'small' | 'neutre'
    ) {
    const table = this.findTable(tableName);
    if (!table) throw new NotFoundException('Table non trouvée');

    const player = table.players.find(p => p.userId === userId);
    if (!player) throw new NotFoundException('Joueur non trouvé à la table');

    if (!['big', 'small', 'neutre'].includes(type)) {
        throw new BadRequestException('Type de blind invalide');
    }

    player.blind = type;

    return {
        table: table.name,
        userId: player.userId,
        username: player.username,
        blind: player.blind,
    };
}

}
