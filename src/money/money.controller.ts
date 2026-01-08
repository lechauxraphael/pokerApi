import { Controller, Dependencies, Post, Param, Get } from '@nestjs/common';
import { MoneyService } from './money.service';
import { UsersService } from 'src/users/users.service';

@Controller('money')
@Dependencies(MoneyService, UsersService)
export class MoneyController {

    moneyService: MoneyService;
    userService: UsersService;
        constructor(moneyService: MoneyService, userService: UsersService) {
            this.moneyService = moneyService;
            this.userService = userService;
        }

    @Get(':userId')
        findOnePlayer(@Param('userId') userId: number) {
            return this.moneyService.getMoney(Number(userId));
        }
}
