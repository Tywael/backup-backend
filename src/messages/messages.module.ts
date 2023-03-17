import { Module } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma.service';
import { AuthMiddleware } from '../users/users.middleware';
import { AuthService } from '../auth/auth.service';
import { AuthModule } from '../auth/auth.module';
import { MessagesController } from './messages.controller';
@Module({
  imports: [
    AuthModule,
  ],
  controllers: [MessagesController],
  providers: [UsersService, PrismaService, AuthMiddleware, AuthService],
})
export class MessagesModule {}