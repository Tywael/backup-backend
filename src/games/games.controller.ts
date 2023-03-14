import { Body, Controller, Delete, Get, Param, Post, Req, Res, UsePipes, ValidationPipe } from '@nestjs/common';
import { GamesService } from './games.service';
import { JoinGameDto } from './dto/joinGame.dto';
import { AuthMiddleware } from 'src/users/users.middleware';
import { Response } from 'express';
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

  @Get('/user')
  async getGamesByUser(@Req() req: RequestWithUser, @Res() res: Response) {
    await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
    const user = req.user;
    if (!user) {
      res.status(401).send({ message: 'Unauthorized' });
    } else {
      const games =  await this.gamesService.getGameByUserId(user.id);
      res.send({ games });
    }
  }

  @Get(':status/status')
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

  @Get(':gameId')
  async getGameById(@Req() req: RequestWithUser, @Res() res: Response, @Param('gameId') gameId: string) {
    await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
    const user = req.user;
    if (!user) {
      res.status(401).send({ message: 'Unauthorized' });
    } else {
      const games =  await this.gamesService.getGameById(gameId);
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
      const games =  await this.gamesService.create(user.id);
      res.send({ games });
    }
  }

  @Post('join')
  @UsePipes(ValidationPipe)
  async joinGame(@Req() req: RequestWithUser, @Body() data: JoinGameDto,  @Res() res: Response) {
    await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
    const user = req.user;
    if (!user) {
      res.status(401).send({ message: 'Unauthorized' });
    } else {
      const games =  await this.gamesService.joinGame(data.gameId, user.id);
      res.send({ games });
    }
  }

  @Delete(':gameId/delete')
  async deleteGame(@Req() req: RequestWithUser, @Res() res: Response, @Param('gameId') gameId: string) {
    await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
    const user = req.user;
    if (!user) {
      res.status(401).send({ message: 'Unauthorized' });
    } else {
      const games =  await this.gamesService.deleteGame(gameId, user.id);
      res.send({ games });
    }
  }
}
