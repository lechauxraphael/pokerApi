import { TablesService } from './tables.service';
import {
    Controller,
    Delete,
    Get,
    Body,
    Post,
    Dependencies,
    Param,
    Req,
    UseGuards,
    UseInterceptors,
    NotFoundException,
    BadRequestException
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import type { IAuthInfoRequest } from '../auth/auth.guard';
import { PokerAction } from './tables.types';
import { HideOtherHandsInterceptor } from './interceptors/hide-other-hands.interceptor';

@Controller('tables')
@Dependencies(TablesService)
export class TablesController {

    tablesService: TablesService;
    constructor(tablesService: TablesService) {
        this.tablesService = tablesService;
    }

    // =========================
    // PUBLIC
    // =========================

    @Get()
    findAll() {
        return this.tablesService.findAll();
    }

    @Get('deck')
    findDeck() {
        return this.tablesService.findDeck();
    }

    @UseGuards(AuthGuard)
    @Get(':tableName/deck')
    getDeckByTable(@Param('tableName') tableName: string) {
        return this.tablesService.getTableDeck(tableName);
    }

    @UseGuards(AuthGuard)
    @Get('deckshuffle')
    shuffle() {
        return this.tablesService.shuffle();
    }

    @UseGuards(AuthGuard)
    @Post(':tableName/action')
    async action(
        @Req() req: IAuthInfoRequest,
        @Param('tableName') tableName: string,
        @Body('type') type: PokerAction,
    ) {

        if (!Object.values(PokerAction).includes(type)) {
            throw new BadRequestException('Action invalide');
        }

        const result = await this.tablesService.performAction(
            req.user.sub,
            tableName,
            type,
        );

        return { success: true, username: req.user.username, result };
    }

    @UseGuards(AuthGuard)
    @Post(':tableName/action/raise')
    async raise(
        @Req() req: IAuthInfoRequest,
        @Param('tableName') tableName: string,
        @Body('somme') somme: number,
    ) {
        const user = req.user;
        return this.tablesService.raise(req.user.sub, tableName, somme);
    }

    @UseGuards(AuthGuard)
    @Post(':tableName/action/fold')
    async fold(
        @Req() req: IAuthInfoRequest,
        @Param('tableName') tableName: string,
    ) {
        return this.tablesService.fold(req.user.sub, tableName);
    }

    @UseGuards(AuthGuard)
    @Post(':tableName/action/check')
    async check(
        @Req() req: IAuthInfoRequest,
        @Param('tableName') tableName: string,
    ) {
        return this.tablesService.check(req.user.sub, tableName);
    }

    @UseGuards(AuthGuard)
    @Post(':tableName/action/allIn')
    async allIn(
        @Req() req: IAuthInfoRequest,
        @Param('tableName') tableName: string,
    ) {
        return this.tablesService.allIn(req.user.sub, tableName);
    }

    @UseGuards(AuthGuard)
    @Post(':tableName/action/call')
    async call(
        @Req() req: IAuthInfoRequest,
        @Param('tableName') tableName: string,
    ) {
        return this.tablesService.call(req.user.sub, tableName);
    }

    // =========================
    // AUTH REQUIRED
    // =========================

    @UseGuards(AuthGuard)
    @Post(':tableName/join')
    joinTable(
        @Param('tableName') tableName: string,
        @Req() req: IAuthInfoRequest
    ) {
        const user = req.user;
        return this.tablesService.joinTable(tableName, {
            userId: user.sub,
            username: user.username,
        });
    }

    @UseGuards(AuthGuard)
    @Delete(':tableName/leave')
    leaveTable(
        @Param('tableName') tableName: string,
        @Req() req: IAuthInfoRequest
    ) {
        const user = req.user;
        if (!user) throw new NotFoundException('Utilisateur non trouvé');

        return this.tablesService.leaveTable(tableName, user.sub);
    }

    @UseGuards(AuthGuard)
    @Post(':tableName/deck/burn')
    burnCard(@Param('tableName') tableName: string) {
        return this.tablesService.burnCard(tableName);
    }

    @UseGuards(AuthGuard)
    @Get(':tableName/deck/cards/:id')
    getCardById(
        @Param('tableName') tableName: string,
        @Param('id') id: string
    ) {
        return this.tablesService.getCardById(tableName, Number(id));
    }

    // @UseGuards(AuthGuard)
    // @Post(':tableName/blind')
    // setBlind(
    //     @Param('tableName') tableName: string,
    //     @Body('type') type: 'big' | 'small' | 'neutre',
    //     @Req() req: IAuthInfoRequest
    // ) {
    //     const user = req.user;
    //     return this.tablesService.setBlind(tableName, user.sub, type);
    // }

    @UseGuards(AuthGuard)
    @UseInterceptors(HideOtherHandsInterceptor)
    @Post(':tableName/games')
    createGame(@Param('tableName') tableName: string, @Req() req: IAuthInfoRequest) {
        return this.tablesService.createGame(tableName, req.user.sub);
    }

    @Get('games')
    getAllGames() {
        return this.tablesService.findAllGames();
    }

    // =========================
    // DYNAMIC
    // =========================

    @Get(':tableName')
    getTable(@Param('tableName') tableName: string) {
        const table = this.tablesService.findTable(tableName);
        if (!table) {
            throw new NotFoundException('Table non trouvée');
        }
        return table;
    }


}