import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Patch, UseGuards} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ChatsService } from './chats.service';
import { Chat } from '@prisma/client';

@Controller('chats')
export class ChatsController {
    constructor(private chatsService: ChatsService) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    async getAllChats(): Promise<Chat[]> {
        return await this.chatsService.getAllChats();
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async getChatsById(@Param('id', ParseUUIDPipe) chatId: string): Promise<Chat> {
        return await this.chatsService.getChatById(chatId);
    }

    @Post()
    async createChat(@Body() data: Chat): Promise<Chat> {
        return await this.chatsService.createChat(data);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    async updateChat(
        @Param('id', ParseUUIDPipe) chatId: string,
        @Body() data: Chat,
    ): Promise<Chat> {
        return await this.chatsService.updateChat(chatId, data);
    }

    @Delete(':id')
    remove(@Param('id', ParseUUIDPipe) chatId: string): Promise<Chat> {
        return this.chatsService.deleteChat(chatId);        
    }
}
