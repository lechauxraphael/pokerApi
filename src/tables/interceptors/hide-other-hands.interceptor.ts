import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class HideOtherHandsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const currentUserId = request.user.sub;

    return next.handle().pipe(
      map(game => {
        if (!game?.players) return game;

        return {
          ...game,
          players: game.players.map((player: any) => {
            if (player.userId !== currentUserId) {
              return {
                ...player,
                hand: ['🂠', '🂠'],
              };
            }
            return player;
          }),
        };
      }),
    );
  }
}
