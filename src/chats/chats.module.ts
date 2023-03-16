import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { PrismaService } from '../prisma.service';
import { UsersModule } from 'src/users/users.module';
import { AuthMiddleware } from 'src/users/users.middleware';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';

@Module({
    imports: [UsersModule],
    controllers: [ChatsController],
    providers: [ChatsService, PrismaService, AuthMiddleware, AuthService, UsersService, JwtService]
})
export class ChatsModule {}