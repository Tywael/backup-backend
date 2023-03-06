import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { PrismaService } from '../prisma.service';
import { JwtStrategy } from "../auth/jwt.strategy";

@Module({
    controllers: [ChatsController],
    providers: [ChatsService, PrismaService, JwtStrategy]
})
export class ChatsModule {}