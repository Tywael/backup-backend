import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Chat, ChatType, UserStatus } from '@prisma/client';
import { identity } from 'rxjs';

@Injectable()
export class ChatsService {
    remove: any;
    constructor(private prisma: PrismaService) {}

    async getAllChats(): Promise<Chat[] | null> {
        const chat = await this.prisma.chat.findMany({
            where: {
                type: ChatType.DIRECT
            },
        }).catch((err) => {
            console.log(err);
            return null;
        });
        return chat;       
    }

    async getChatById(chatId: string): Promise<Chat> {
        return await this.prisma.chat.findUnique({ where: { id: chatId } });        
    }

    async createChat({ user1Id, user2Id }: { user1Id: string, user2Id: string }): Promise<Chat | null> {
        if (!user1Id || !user2Id) {
            console.log("error: userIds incorect");
            return null;
        }
        let chat = await this.prisma.chat.create({
            data: {

                },
            }).catch((err) => {
                console.log(err);
                return null;
            });

            await this.prisma.userChat.create({ 
                data: {
                    userId: user1Id,
                    chatId: chat.id,
                }
            }).catch((err) => {
                console.log(err);
                this.deleteChat(chat.Id);
                return null;
            });

            await this.prisma.userChat.create({ 
                data: {
                    userId: user2Id,
                    chatId: chat.id,
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
