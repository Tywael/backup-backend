import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Req, Res, Next } from '@nestjs/common';
import { GamesService } from './games.service';
import { Game } from '@prisma/client';
import { AuthMiddleware } from 'src/users/users.middleware';
import { NextFunction, Response } from 'express';
import { RequestWithUser } from 'src/interfaces/request-with-user.interface';

@Controller('games')
export class GamesController {
  constructor(
    private gamesService: GamesService,
    private authMiddleware: AuthMiddleware,
    ) {}


  @Get()
  async getAllGames(@Req() req: RequestWithUser, @Res() res: Response) {
    await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
    const user = req.user;
    if (!user) {
      res.status(401).send({ message: 'Unauthorized' });
    } else {
      const games =  await this.gamesService.getAllGames();
      res.send({ games });
    }
  }

  @Get(':status')
  async getGameByStatus(@Req() req: RequestWithUser, @Res() res: Response, @Param('status') status: string) {
    await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
    const user = req.user;
    if (!user) {
      res.status(401).send({ message: 'Unauthorized' });
    } else {
      const games =  await this.gamesService.getGameByStatus(status);
      res.send({ games });
    }
  }

  @Post('/create')
  async createGame(@Req() req: RequestWithUser, @Res() res: Response) {
    await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
    const user = req.user;
    if (!user) {
      res.status(401).send({ message: 'Unauthorized' });
    } else {
      const games =  await this.gamesService.create(user.id); // TODO: Create the game and set 1st player FK + game as Waiting
      res.send({ games });
    }
  }

  @Post('join')
  async joinGame(@Req() req: RequestWithUser, @Body() data: {gameId: string},  @Res() res: Response) {
    await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
   // TODO: should check if game is waiting and if user is not already in game
    const user = req.user;
    if (!user) {
      res.status(401).send({ message: 'Unauthorized' });
    } else {
      const games =  await this.gamesService.joinGame(data.gameId, user.id);
      res.send({ games });
    }
  }

  @Delete(':gameid')
  remove(@Param('gameid', ParseUUIDPipe) gameId: string): Promise<Game> {
    return this.gamesService.deleteGame(gameId);
  }
}
