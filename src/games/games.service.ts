import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Game, GameStatus, UserGame } from '@prisma/client';

@Injectable()
export class GamesService {
  remove: any;
  constructor(private prisma: PrismaService) {}

  async create( userId: string): Promise<Game | void> {
    let game = await this.prisma.game.create({
      data: {
      status: GameStatus.WAITING,
      },
    })
    .then((game) => {
      this.createUserGame(game.id, userId);
      return game;
    })
    .catch((err) => {
      console.log(err);
      throw new BadRequestException(err);
    });

    return game;
  }

  async createUserGame(gameId: string, userId: string): Promise<UserGame | void> {
    return await this.prisma.userGame.create({
      data: {
      userId: userId,
      gameId: gameId,
      },
    }).catch((err) => {
      console.log(err);
      throw new BadRequestException(err);
    });
  }


  async getAllGames(): Promise<Game[] | void> {
    const games = await this.prisma.game.findMany().catch((err) => {
    throw new BadRequestException(err);
	});
	return games;
  }

  async getGameById(gameId: string): Promise<Game> {
    return await this.prisma.game.findUnique({ where: { id: gameId } });
  }

  async getGameByStatus(status: string): Promise<Game[] | void> {
    if (status != GameStatus.WAITING && status != GameStatus.INPROGRESS && status != GameStatus.FINISHED)
      throw new BadRequestException("Invalid status");
    const games = await this.prisma.game.findMany(
      { where: { status: status } })
    .catch((err) => {
      throw new BadRequestException(err);
    });
    return games;
  }

  // new user join a game
  async joinGame(gameId: string, userId: string): Promise<Game | void> {
    const game = await this.prisma.game.findUnique({ where: { id: gameId } });

    // check if that the user joininh is not already in the game
    const userGame = await this.prisma.userGame.findMany({ where: { gameId: gameId, userId: userId } });
    if (userGame.length > 0)
      throw new BadRequestException("User already in game");

    if (game.status == GameStatus.FINISHED || game.status == GameStatus.INPROGRESS)
      throw new BadRequestException("Game is already in progress or finished");

    this.createUserGame(gameId, userId);

    return await this.prisma.game.update({
      where: { id: gameId },
      data: {  status: GameStatus.INPROGRESS },
    })
    .catch((err) => {
      console.log(err);
      throw new BadRequestException(err);
    });
  }

  async deleteGame(gameId: string): Promise<Game | null> {
    return await this.prisma.game.delete({ where: { id: gameId } });
  }
		
}
