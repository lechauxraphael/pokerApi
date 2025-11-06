import { Controller, Dependencies, Get, Post, Body } from '@nestjs/common';
import { tablesService } from './tables.service';

@Controller('tables')
@Dependencies(tablesService)
export class TablesController {

    tablesService: tablesService;
    constructor(tablesService: tablesService) {
        this.tablesService = tablesService;
    }

    @Get()
    findAll() {
        return this.tablesService.findAll();
    }

    @Get('deck')
    findDeck() {
        return this.tablesService.findDeck();
    }

    @Get('deckshuffle')
    shuffle() {
        return this.tablesService.shuffle();
    }

    @Post('distribute')
        distribute(@Body('deck') deck?: any[]) {
        return this.tablesService.distribute(deck);
    }
}
