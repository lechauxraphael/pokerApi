import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthentificationController } from './authentification/authentification.controller';
import { authService  } from './authentification/authentification.service';
import { TablesController } from './tables/tables.controller';
import { tablesService } from './tables/tables.service';
import { DecksService } from './decks/decks.service';

@Module({
  imports: [],
  controllers: [AppController, AuthentificationController, TablesController],
  providers: [AppService, authService, tablesService, DecksService],
})
export class AppModule {}
