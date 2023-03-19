import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ChatsModule } from './chats/chats.module';
import { ChannelsModule } from './channels/channels.module';
import { GamesModule } from './games/games.module';
import { FriendsModule } from './friends/friends.modules';
import { MessagesModule } from './messages/messages.module';
import { SocketsGateway } from './socket/socket.gateway';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    AuthModule,
    UsersModule,
    ChatsModule,
    ChannelsModule,
    GamesModule,
    FriendsModule,
    MessagesModule,
  ],
  controllers: [AppController],
  providers: [AppService, SocketsGateway,],
})
export class AppModule {}
