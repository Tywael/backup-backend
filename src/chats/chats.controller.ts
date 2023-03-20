import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Patch, UseGuards, Req, Res} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { Chat, User } from '@prisma/client';
import { AuthMiddleware } from 'src/users/users.middleware';
import { NextFunction, Response } from 'express';
import { RequestWithUser } from 'src/interfaces/request-with-user.interface';
import { ApiTags, ApiOkResponse, ApiResponse } from '@nestjs/swagger';
import { CreateChatDto } from './dto/chats.dto';
import { SocketsGateway } from 'src/socket/socket.gateway';

@Controller('chats')
@ApiTags('Chats')
export class ChatsController {
    constructor(
        private chatsService: ChatsService,
        private authMiddleware: AuthMiddleware,
        private socketGateway: SocketsGateway,
    ) {}

    @Get()
    async getAllChats(@Req() req: RequestWithUser, @Res() res: Response) {
        await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
        const user = req.user;
        if (!user) {
            res.status(401).send({ message: 'unauthorized' });
        } else {
            const chats = await this.chatsService.getAllChats();
            res.send({ chats });
        }
    }

    @Get('@me')
    async getMyAllChats(@Req() req: RequestWithUser, @Res() res: Response) {
        await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
        const user = req.user;
        if (!user) {
            res.status(401).send({ message: 'unauthorized' });
        } else {
            const chats = await this.chatsService.getChatByUser(user.id);
            res.send({ chats });
        }
    }

    @Get(':id')
    async getChatsById(
        @Param('id', ParseUUIDPipe) chatId: string,
        @Req() req: RequestWithUser,
        @Res() res: Response,
    ) {
        await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
        const user = req.user;
        if (!user) {
            res.status(401).send({ message: 'unauthorized' });
        } else {
            let chat = await this.chatsService.getChatById(chatId);
            if (chat) {
                const room = await this.socketGateway.getSocketIdByChatId(chat.id);
                console.log(room)
            }
            res.send({ chat });
        }
    }

    @Post('create')
    @ApiOkResponse({ type: CreateChatDto })
    async create(
        @Body() data: {userId: string},
        @Req() req: RequestWithUser, 
        @Res() res: Response
    ) {
        await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
        const user = req.user;
        if (!user) {
            res.status(401).send({ message: 'unauthorized' });
        } else {
            const chat = await this.chatsService.createChat({ user1Id: user.id, user2Id: data.userId });
            // Add user to socket room
            if (chat) {    
                this.socketGateway.createSocketRoom(chat.id, user.id);
                this.socketGateway.createSocketRoom(chat.id, data.userId);
            }
            res.send({ chat });
        }
    }

    @Patch(':id')
    async update(
        @Param('id', ParseUUIDPipe) chatId: string,
        @Body() data: Chat,
    ): Promise<Chat> {
        return await this.chatsService.updateChat(chatId, data);
    }

    @Delete(':id')
    async delete(
        @Param('id', ParseUUIDPipe) chatId: string, 
        @Req() req: RequestWithUser, 
        @Res() res: Response
        ) {      
        await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
        const user = req.user;
        if (!user) {
          res.status(401).send({ message: 'Unauthorized' });
        } else {
          const chats =  await this.chatsService.deleteChat(chatId, user.id);
          res.send({ chats });
        }
    }
}
