import { Controller, Dependencies, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
@Dependencies(UsersService)
export class UsersController {

    usersService: UsersService;
    constructor(usersService: UsersService) {
        this.usersService = usersService;
    }
    
    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':userId')
    findOnePlayer(@Param('userId') userId: number) {
        return this.usersService.findOnePlayer(Number(userId));
    }
}
