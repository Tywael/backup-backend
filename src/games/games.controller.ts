import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { GamesService } from './games.service';
import { Game } from '@prisma/client';

@Controller('games')
export class GamesController {
  constructor(private gamesService: GamesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllGames(): Promise<Game[]> {
    return await this.gamesService.getAllGames();
  }

  @UseGuards(JwtAuthGuard)
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