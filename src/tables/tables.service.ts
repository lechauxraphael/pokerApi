import { Injectable, BadRequestException, NotFoundException, NotImplementedException } from '@nestjs/common';
import { DecksService } from 'src/decks/decks.service';
import { PokerAction } from './tables.types';
import { UsersService } from 'src/users/users.service';
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
            blind: {
                types: string;
                amount: number;
            };
            folded?: boolean;
            allIn?: boolean;
            check?: boolean;
            call?: boolean;
            raise?: boolean;
            currentBet?: number;
            miseTotaleTable?: number;
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
            table.players.push({ ...user, hand: [], blind: { types: 'neutre', amount: 0 }, currentBet: 0, miseTotaleTable: 0 });
        }
        return table;
    }

    leaveTable(name: string, userId: number) {
        const table = this.findTable(name);
        if (!table) throw new NotFoundException('Table non trouvée');

        table.players = table.players.filter(p => p.userId !== userId);
        return table;
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

    // setBlind(
    //     tableName: string,
    //     userId: number,
    //     type: 'big' | 'small' | 'neutre'
    // ) {
    //     const table = this.findTable(tableName);
    //     if (!table) throw new NotFoundException('Table non trouvée');

    //     const player = table.players.find(p => p.userId === userId);
    //     if (!player) throw new NotFoundException('Joueur non trouvé à la table');

    //     if (!['big', 'small', 'neutre'].includes(type)) {
    //         throw new BadRequestException('Type de blind invalide');
    //     }

    //     player.blind = type;

    //     return {
    //         table: table.name,
    //         userId: player.userId,
    //         username: player.username,
    //         blind: player.blind,
    //     };
    // }
    async createGame(tableName: string, userId: number) {
        const table = this.findTable(tableName);
        if (!table) {
            throw new NotFoundException('Table non trouvée');
        }

        if (table.players.length <= 2) {
            throw new BadRequestException('Il faut au moins 3 joueurs pour lancer une partie');
        }

        const player = table.players.find(p => p.userId === userId);
        if (!player) throw new NotFoundException('Joueur non trouvé à la table');

        const user = await this.usersService.findOnePlayer(userId);
        if (!user) throw new NotFoundException('Utilisateur non trouvé');
   

        // Distribuer les cartes aux joueurs
        table.players.forEach(player => {
            player.hand = [
                table.deck.shift(),
                table.deck.shift(),
            ];
        });

        const blinds = [{types: 'small', amount: 2}, {types: 'big', amount: 5}];


        table.players.forEach((player, index) => {
            player.blind = blinds[index] ?? {types: 'neutre', amount: 0};
        });


        for (const player of table.players) {
            if (player.blind.types !== 'neutre') {
                const userToUpdate = await this.usersService.findOnePlayer(player.userId);
                if (!userToUpdate) continue;

                userToUpdate.money -= player.blind.amount;
                await this.usersRepository.save(userToUpdate);
            }
        }

        player.currentBet = 5; // Le big blind commence à 5

        const game = {
            id: table.games.length + 1,
            createdAt: new Date(),
            status: 'running' as const,
            miseActuelle: player.currentBet,
            players: table.players.map(p => ({
                userId: p.userId,
                username: p.username,
                blind: p.blind,
                hand: p.hand,
            })),

        };
        await this.usersRepository.save(user);
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

    async allIn(userId: number, tableName: string) {
        const table = this.findTable(tableName);
        if (!table) throw new BadRequestException('Table non trouvée');

        const player = table.players.find(p => p.userId === userId);
        if (!player) throw new BadRequestException('Vous n’êtes pas à cette table');

        const user = await this.usersService.findOnePlayer(userId);
        if (!user) throw new NotFoundException('Utilisateur non trouvé');

        if (player.folded) {
            throw new BadRequestException('Vous avez déjà fold');
        }
        const allIn = user?.money;
        user.money = 0;
        await this.usersRepository.save(user);
        return { username: user.username, action: PokerAction.ALL_IN, sommeAllIn: allIn };
    }

    async fold(userId: number, tableName: string) {
        const table = this.findTable(tableName);
        if (!table) throw new BadRequestException('Table non trouvée');

        const player = table.players.find(p => p.userId === userId);
        if (!player) throw new BadRequestException('Vous n’êtes pas à cette table');

        const user = await this.usersService.findOnePlayer(userId);
        if (!user) throw new NotFoundException('Utilisateur non trouvé');

        player.folded = true;
        return { username: user.username, action: PokerAction.FOLD };
    }

    async check(userId: number, tableName: string) {
        const table = this.findTable(tableName);
        if (!table) throw new BadRequestException('Table non trouvée');

        const player = table.players.find(p => p.userId === userId);
        if (!player) throw new BadRequestException('Vous n’êtes pas à cette table');

        const user = await this.usersService.findOnePlayer(userId);
        if (!user) throw new NotFoundException('Utilisateur non trouvé');

        if (player.folded) {
            throw new BadRequestException('Vous avez déjà fold');
        }

        player.check = true;
        return { username: user.username, action: PokerAction.CHECK };
    }

    async call(userId: number, tableName: string) {
        const table = this.findTable(tableName);
        if (!table) throw new BadRequestException('Table non trouvée');

        const player = table.players.find(p => p.userId === userId);
        if (!player) throw new BadRequestException('Vous n’êtes pas à cette table');

        const user = await this.usersService.findOnePlayer(userId);
        if (!user) throw new NotFoundException('Utilisateur non trouvé');

        if (player.folded) {
            throw new BadRequestException('Vous avez déjà fold');
        }

        const moneyUser = user?.money; // Argent actuel de l'utilisateur
        const sommeACall = player.currentBet ?? 0; // Somme que l'utilisateur veut miser

        if (moneyUser < sommeACall) {
            throw new BadRequestException('Fonds insuffisants pour cette mise');
        }
        const montant = sommeACall;
        user.money = moneyUser - sommeACall; // Déduire la somme du solde de l'utilisateur
        player.miseTotaleTable = (player.miseTotaleTable ?? 0) + montant; // Mettre à jour la mise totale du joueur
        player.call = true;
        await this.usersRepository.save(user);

        return { username: user.username, action: PokerAction.CALL, sommeMisé: player.currentBet, argentRestant: user.money, miseTotaleTable: player.miseTotaleTable };
    }

    async raise(userId: number, tableName: string, somme: number) {

        const table = this.findTable(tableName);
        if (!table) throw new BadRequestException('Table non trouvée');

        const player = table.players.find(p => p.userId === userId);
        if (!player) throw new BadRequestException('Vous n’êtes pas à cette table');

        const user = await this.usersService.findOnePlayer(userId);
        if (!user) throw new NotFoundException('Utilisateur non trouvé');

        if (player.folded) {
            throw new BadRequestException('Vous avez déjà fold');
        }

        const moneyUser = user?.money; // Argent actuel de l'utilisateur
        const sommeARaiser = Number(somme); // Somme que l'utilisateur veut miser

        if (moneyUser < sommeARaiser) {
            throw new BadRequestException('Fonds insuffisants pour cette mise');
        }
        const montant = sommeARaiser;
        user.money = moneyUser - sommeARaiser; // Déduire la somme du solde de l'utilisateur
        player.miseTotaleTable = (player.miseTotaleTable ?? 0) + montant; // Mettre à jour la mise totale du joueur
        player.currentBet = montant;
        player.raise = true;
        await this.usersRepository.save(user);

        return { username: user.username, action: PokerAction.RAISE, sommeMisé: player.currentBet, argentRestant: user.money, miseTotaleTable: player.miseTotaleTable };
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
            case PokerAction.FOLD:
                player.folded = true;
                return { action: PokerAction.FOLD };

            case PokerAction.CHECK:
                player.check = true;
                return { action: PokerAction.CHECK };

            case PokerAction.CALL:
                return { action: PokerAction.CALL };

            case PokerAction.RAISE:
                return this.raise;
            case PokerAction.ALL_IN:
                player.allIn = true;
                return this.allIn(userId, tableName);
            default:
                throw new NotImplementedException('Action inconnue');
        }
    }
}