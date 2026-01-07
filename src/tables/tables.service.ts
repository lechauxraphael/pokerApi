import { Injectable, BadRequestException, NotFoundException, NotImplementedException } from '@nestjs/common';
import { DecksService } from 'src/decks/decks.service';
import { PokerAction } from './tables.types';
import { UsersService } from 'src/users/users.service';
import { IntegerType } from 'typeorm';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TablesService {
    private tables: {
        name: string;
        players: {
            userId: number;
            username: string;
            hand?: any[];
            blind?: 'big' | 'small' | 'neutre';
            folded?: boolean;
            allIn?: boolean;
            check?: boolean;
            currentBet?: number;
        }[];
        deck: any[];
        games: {
            id: number;
            createdAt: Date;
            status: 'waiting' | 'running' | 'finished';
            players: {
                userId: number;
                username: string;
            }[];
        }[];
    }[] = [];

    constructor(private readonly decksService: DecksService
        , private readonly usersService: UsersService,   
         @InjectRepository(User)
    private usersRepository: Repository<User>,
    ) {
        this.tables = [
            {
                name: 'Table1',
                players: [],
                deck: this.decksService.shuffle(this.decksService.createDeck()),
                games: [],
            },
            {
                name: 'Table2',
                players: [],
                deck: this.decksService.shuffle(this.decksService.createDeck()),
                games: [],
            },
            {
                name: 'Table3',
                players: [],
                deck: this.decksService.shuffle(this.decksService.createDeck()),
                games: [],
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
    createGame(tableName: string) {
        const table = this.findTable(tableName);
        if (!table) {
            throw new NotFoundException('Table non trouvée');
        }

        if (table.players.length <= 2) {
            throw new BadRequestException('Il faut au moins 3 joueurs pour lancer une partie');
        }

        const game = {
            id: table.games.length + 1,
            createdAt: new Date(),
            status: 'running' as const,
            players: table.players.map(p => ({
                userId: p.userId,
                username: p.username,
            })),
        };

        table.games.push(game);

        return game;
    }

    findAllGames() {
        return this.tables.flatMap(table =>
            table.games.map(game => ({
                tableName: table.name,
                ...game,
            })),
        );
    }

    async allIn(userId: number){
        const user = await this.usersService.findOnePlayer(userId);
        if (!user) throw new NotFoundException('Utilisateur non trouvé');
        const allIn = user?.money;
        user.money = 0;
        await this.usersRepository.save(user);
        return allIn;
    }   


    async raise(userId: number, tableName: string, somme: number){

        const table = this.findTable(tableName);
        if (!table) throw new BadRequestException('Table non trouvée');

        const player = table.players.find(p => p.userId === userId);
        if (!player) throw new BadRequestException('Vous n’êtes pas à cette table');

        const user = await this.usersService.findOnePlayer(userId);
        if (!user) throw new NotFoundException('Utilisateur non trouvé');

        const moneyUser = user?.money; // Argent actuel de l'utilisateur
        const sommeARaiser = somme; // Somme que l'utilisateur veut miser

        if(moneyUser < sommeARaiser){
            throw new BadRequestException('Fonds insuffisants pour cette mise');
        }

        user.money = moneyUser - sommeARaiser; // Déduire la somme du solde de l'utilisateur
        await this.usersRepository.save(user);
        return {username: user.username, sommeMisé : sommeARaiser, argentRestant: user.money};
    }

    performAction(
        userId: number,
        tableName: string,
        type: PokerAction,
    ) {
        const table = this.findTable(tableName);
        if (!table) throw new BadRequestException('Table non trouvée');

        const player = table.players.find(p => p.userId === userId);
        if (!player) throw new BadRequestException('Vous n’êtes pas à cette table');

        player.currentBet ??= 0;
        player.folded ??= false;

        if (player.folded) {
            throw new BadRequestException('Vous avez déjà fold');
        }

        switch (type) {
            case 'fold':
                player.folded = true;
                return { action: 'fold' };
            case 'check':
                player.check = true
                return { action: 'check' };
            case 'call':
                // TODO: gérer les mises
                return { action: 'call' };
            case 'raise':
            case 'all-in':     
                player.allIn = true;
                return this.allIn(userId);       
            default:
                throw new NotImplementedException('Action inconnue');
        }
    }
}