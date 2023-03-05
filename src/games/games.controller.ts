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

    //TODO: get all games by status

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

  @Get(':gameid')
  async getUserById(@Param('gameid', ParseUUIDPipe) gameId: string): Promise<Game> {
    return await this.gamesService.getGameById(gameId);
  }

  @Post(':userid')
  async createGame(@Body() data: { userId: string }): Promise<Game> {
	return await this.gamesService.create({ userId: data.userId });
  }

  @Delete(':gameid')
  remove(@Param('gameid', ParseUUIDPipe) gameId: string): Promise<Game> {
    return this.gamesService.deleteGame(gameId);
  }
}