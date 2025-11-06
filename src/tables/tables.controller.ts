import { Controller, Dependencies, Get } from '@nestjs/common';
import { tablesService } from './tables.service';

@Controller('tables')
@Dependencies(tablesService)
export class TablesController {

    tablesService: tablesService;
    constructor(tablesService: tablesService){
        this.tablesService = tablesService;
    }

    @Get()
    findAll(){
        return this.tablesService.findAll();
    }

    @Get('deck')
    findDeck(){
        return this.tablesService.findDeck();
    }

    @Get('deckshuffle')
    shuffle(){
        return this.tablesService.shuffle();
    }
}
