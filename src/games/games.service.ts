import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Game, GameStatus } from '@prisma/client';

@Injectable()
export class GamesService {
  remove: any;
  constructor(private prisma: PrismaService) {}

  async create({ userId }: { userId: string }): Promise<Game | null> {
    let game = await this.prisma.game.create({
	  data: {
		status: GameStatus.WAITING,
	  },
	}).catch((err) => {
	  console.log(err);
	  // should throw new BadRequestException('User not found.'); instead
	  return null;
	});
	
	await this.prisma.userGame.create({
		data: {
			userId: userId,
			gameId: game.id,
		},
	}).catch((err) => {
		console.log(err);
		// should throw new BadRequestException('User not found.'); instead
		this.deleteGame(game.id);
		return null;
	});
	
    return game;
}

async updateGameStatus(gameId: string, status: GameStatus): Promise<Game | null> {
	const game = await this.prisma.game.update({
		where: { id: gameId },
		data: {  status },
    }).catch((err) => {
		console.log(err);
		// should throw new BadRequestException(err); instead of returning null
		return null;
	});
    return game;
}

  async getAllGames(): Promise<Game[] | null> {
    const games = await this.prisma.game.findMany().catch((err) => {
		console.log(err);
		return null;
	});
	return games;
  }

  async getGameById(gameId: string): Promise<Game> {
    return await this.prisma.game.findUnique({ where: { id: gameId } });
  }

  // new user join a game
  async joinGame(gameId: string, data: Game, userId: string): Promise<Game | null> {
	if (data.status == GameStatus.FINISHED || data.status == GameStatus.INPROGRESS)
	  return null;

	await this.prisma.userGame.create({
	  data: {
		userId: userId,
		gameId: gameId,
	  },
	}).catch((err) => {
	  console.log(err);
	  return null;
	});

    return await this.prisma.game.update({
	  where: { id: gameId },
	  data: {  status: GameStatus.INPROGRESS },
	}).catch((err) => {
		console.log(err);
		return null;
		// TODO: delete userGame
	});
  }

  async deleteGame(gameId: string): Promise<Game | null> {
    return await this.prisma.game.delete({ where: { id: gameId } });
  }
		
}
