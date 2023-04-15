import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { SocketsGateway } from './socket.gateway';

@Module({
  imports: [],
  controllers: [],
  providers: [SocketsGateway, PrismaService],
  exports: [SocketsGateway],
})
export class SocketsModule {}
