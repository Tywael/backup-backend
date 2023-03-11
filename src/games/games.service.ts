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

async updateGameStatus(gameId: string, status: GameStatus): Promise<Game | void> {
	const game = await this.prisma.game.update({
		where: { id: gameId },
		data: {  status },
    }).catch((err) => {
		console.log(err);
    throw new BadRequestException(err);
	});
    return game;
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

  // new user join a game
  async joinGame(gameId: string, userId: string): Promise<Game | null> {
    const game = await this.prisma.game.findUnique({ where: { id: gameId } });
    if (game.status == GameStatus.FINISHED || game.status == GameStatus.INPROGRESS)
      return null;

    this.createUserGame(gameId, userId);

    return await this.prisma.game.update({
      where: { id: gameId },
      data: {  status: GameStatus.INPROGRESS },
    })
    .catch((err) => {
      throw new BadRequestException(err);
    });
  }

  async deleteGame(gameId: string): Promise<Game | null> {
    return await this.prisma.game.delete({ where: { id: gameId } });
  }
		
}
