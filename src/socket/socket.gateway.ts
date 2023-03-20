import { WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.WEB_URL,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    credentials: true,
  },
})
export class SocketsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() server: Server;

  private logger: Logger = new Logger('SocketGateway');

  afterInit(server: any) {
    this.logger.log('WebSocket server initialized');
  }

  handleConnection(client: any, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: any) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Get socket by chat
  async getSocketIdByChatId(chatId: string): Promise<string>
  {
    const roomName = `chat-${chatId}`;
    const room = this.server.sockets.adapter.rooms.get(roomName);
    if (room) {
      const socketId = room.values().next().value;
      return socketId;
    } else {
      return '';
    }
  }

  // new chat
  async createSocketRoom(chatId: string, clientId: string)
  {
    const roomName = `chat-${chatId}`;
    const socket = this.server.of('/').sockets.get(clientId);
    if (socket) {
      socket.join(roomName);
      this.logger.log(`Client ${clientId} added to socket room ${roomName}`);
    } else {
      this.logger.error(`Client ${clientId} not found`);
    }
  }

  // delete chat
  async deleteSocketRoom(chatId: string, clientId: string)
  {
    const roomName = `chat-${chatId}`;
    const socket = this.server.of('/').sockets.get(clientId);
    if (socket) {
      socket.leave(roomName);
      this.logger.log(`Client ${clientId} removed from socket room ${roomName}`);
    } else {
      this.logger.error(`Client ${clientId} not found`);
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: any, payload: any): string {
    this.logger.log(`Received joinRoom from client: ${payload}`);
    const roomName = `chat-${payload.chatId}`;
    client.join(roomName);
    return 'Joined room';
  }
  

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    this.logger.log(`Received message from client: ${payload}`);
    return 'Message received';
  }

  // Define the init method as required by the OnGatewayInit interface
  public init(server: Server) {
    this.logger.log('Sockets gateway initialized');
  }
}
