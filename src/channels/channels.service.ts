import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Chat, ChatType, UserChatStatus, UserStatus } from '@prisma/client';
import { identity } from 'rxjs';

@Injectable()
export class ChannelsService {
    remove: any;
    constructor(private prisma: PrismaService) {}

    async getAllChannels(): Promise<Chat[] | null> {
        const chat = await this.prisma.chat.findMany({
            where: {
                type: { not: ChatType.DIRECT }
            },
        }).catch((err) => {
            console.log(err);
            return null;
        });
        return chat;       
    }

    async getChannelById(chatId: string): Promise<Chat> {
        return await this.prisma.chat.findUnique({ where: { id: chatId } });        
    }

    async getChannelsByUser(userTofindId: string): Promise<Chat[] | null> {
        let chatUser = await this.prisma.userChat.findMany({
            where: {
                userId: userTofindId
            }
        })
        const chats = await this.prisma.chat.findMany({
            where: {
                id: { in: chatUser.map((userChat) => userChat.chatId)}, 
                type: { not: ChatType.DIRECT},
            }
        })

        return chats
    }

    async createChannel({ userId }: { userId: string }): Promise<Chat | null> {
        if (!userId) {
            console.log("error: userIds incorect");
            return null;
        }
        let channel = await this.prisma.chat.create({
                data: {
                    type: ChatType.PUBLIC
                },
            }).catch((err) => {
                console.log(err);
                return null;
            });

            await this.prisma.userChat.create({ 
                data: {
                    userId: userId,
                    chatId: channel.id,
                    status: UserChatStatus.OWNER,
                }
            }).catch((err) => {
                console.log(err);
                this.deleteChannel(channel.Id);
                return null;
            });
        return channel;      
    }

    async updateChannel(chatId: string, data: Chat): Promise<Chat> {
        return await this.prisma.chat.update({ where: { id: chatId }, data });
    }

    async deleteChannel(chatId: string): Promise<Chat> {
        return await this.prisma.chat.delete({ where: { id: chatId } });        
    }
}
