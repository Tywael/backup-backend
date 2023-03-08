import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Patch, UseGuards, Req, Res} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { Chat } from '@prisma/client';
import { AuthMiddleware } from 'src/users/users.middleware';
import { NextFunction, Response } from 'express';
import { RequestWithUser } from 'src/interfaces/request-with-user.interface';
import { resolve } from 'path';

@Controller('chats')
export class ChatsController {
    constructor(
        private chatsService: ChatsService,
        private authMiddleware: AuthMiddleware,
        ) {}

    @Get()
    async getAllChats(@Req() req: RequestWithUser, @Res() res: Response) {
        await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
        const user = req.user;

        res.send({ await this.chatsService.getAllChats(); });
        // if (!user) {
        //     res.status(401).send({ message: 'unauthorized' });
        // } else {
        //     const chats = await this.chatsService.getAllChats();
        //     res.send({ chats });
        // }
    }

    @Get(':chatid')
    async getChatsById(@Param('chatid', ParseUUIDPipe) chatId: string): Promise<Chat> {
        return await this.chatsService.getChatById(chatId);
    }

    @Post(':userid')
    async createChat(@Body() data: { userId: string }): Promise<Chat> {
        return await this.chatsService.createChat({ userId: data.userId });
    }

    @Patch(':id')
    async updateChat(
        @Param('id', ParseUUIDPipe) chatId: string,
        @Body() data: Chat,
    ): Promise<Chat> {
        return await this.chatsService.updateChat(chatId, data);
    }

    @Delete(':chatid')
    remove(@Param('chatid', ParseUUIDPipe) chatId: string): Promise<Chat> {
        return this.chatsService.deleteChat(chatId);        
    }
}
