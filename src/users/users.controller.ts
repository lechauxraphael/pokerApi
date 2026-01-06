import { Controller, BadRequestException, NotFoundException, Body, Dependencies, Post, Get, Param, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import type { IAuthInfoRequest } from '../auth/auth.guard';
@Controller('users')
@Dependencies(UsersService)
export class UsersController {

    usersService: UsersService;
    constructor(usersService: UsersService) {
        this.usersService = usersService;
    }

    @UseGuards(AuthGuard)
    @Get('me')
    async getProfile(@Req() req: IAuthInfoRequest) {
        const user = await this.usersService.findOnePlayer(req.user.sub);
        if (!user) throw new NotFoundException('Utilisateur non trouvé');
        return {
            userId: user.userId,
            username: user.username,
            money: user.money,
        };
    }

    @UseGuards(AuthGuard)
    @Get('me/money')
    async getMoney(@Req() req: IAuthInfoRequest) {
        const user = await this.usersService.findOnePlayer(req.user.sub);
        if (!user) throw new NotFoundException('Utilisateur non trouvé');
        return { money: user.money };
    }

    @UseGuards(AuthGuard)
    @Post('me/deposit')
    async deposit(@Req() req: IAuthInfoRequest, @Body('amount') amount: number) {
        if (amount <= 0) {
            throw new BadRequestException('Le montant doit être supérieur à 0');
        }
        const money = await this.usersService.deposit(req.user.sub, amount);
        return { money };
    }

    @Get(':userId')
    async getUser(@Param('userId') userId: number) {
        const user = await this.usersService.findOnePlayer(Number(userId));
        if (!user) throw new NotFoundException('Utilisateur non trouvé');
        return {
            userId: user.userId,
            username: user.username,
        };
    }

    @Get()
    findAll() {
        return this.usersService.findAll();
    }
    
}
