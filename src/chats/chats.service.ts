import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Chat, UserStatus } from '@prisma/client';

@Injectable()
export class ChatsService {
    remove: any;
    constructor(private prisma: PrismaService) {}

    async getAllChats(): Promise<Chat[]> {
        return await this.prisma.chat.findMany();       
    }

    async getChatById(chatId: string): Promise<Chat> {
        return await this.prisma.chat.findUnique({ where: { id: chatId } });        
    }

    async createChat({ userId }: { userId: string }): Promise<Chat | null> {
        let chat = await this.prisma.chat.create({
            data: {

                },
            }).catch((err) => {
                console.log(err);
                return null;
            });

            await this.prisma.userChat.create({ 
                data: {
                    userId: userId,
                    chatId: ChatsService.bind,
                }
            }).catch((err) => {
                console.log(err);
                this.deleteChat(chat.Id);
                return null;
            });
        return chat;      
    }

    async updateChat(chatId: string, data: Chat): Promise<Chat> {
        return await this.prisma.chat.update({ where: { id: chatId }, data });
    }

    async deleteChat(chatId: string): Promise<Chat> {
        return await this.prisma.chat.delete({ where: { id: chatId } });        
    }
}
