import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { PrismaService } from '../prisma.service';
import { JwtStrategy } from "../auth/jwt.strategy";

@Module({
  controllers: [GamesController],
  providers: [GamesService, PrismaService, JwtStrategy]
})
export class GamesModule {}