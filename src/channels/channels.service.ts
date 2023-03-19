import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Chat, ChatType, UserChatStatus } from '@prisma/client';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ChannelsService {
    remove: any;
    constructor(
        private prisma: PrismaService, 
        private usersService: UsersService
    ) {}

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

    async createChannel(CreateChannelDto): Promise<Chat | null> {
        const userId = CreateChannelDto.userId;
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
                return null;
            });
        return channel;      
    }

    async joinChannel(chatId: string, userId: string): Promise<Chat | void> {
        const channel = await this.prisma.chat.findUnique({ where: { id: chatId } });
        const userChannel = await this.prisma.userChat.findMany({ where: { chatId: chatId, userId: userId } });
        
        if (userChannel.length > 0)
            throw new BadRequestException("User are Already in the channel");
        
        if (channel.type != ChatType.PUBLIC)
            throw new BadRequestException("User can't join this channel");
        
        await this.prisma.userChat.create({
            data: {
                userId: userId,
                chatId: chatId,
                status: UserChatStatus.MEMBER,
            }
        })
        return channel;
    }

    async updateChannel(chatId: string, data: Chat): Promise<Chat> {
        return await this.prisma.chat.update({ where: { id: chatId }, data });
    }

    
    async deletechanel(chatId: string, userId: string): Promise<Chat | null> {
        // Check if channel exist
        const channel = await this.prisma.chat.findUnique({ where: { id: chatId } });
        if (!channel) {
            throw new BadRequestException("Channel not found");
        }

        const user = await this.prisma.user.findUnique({
            where: {
                id: userId
            }
        }).catch((err) => {
            throw new BadRequestException(err);
        });

        if (user.role != "ADMIN") {
            const userChat = await this.prisma.userChat.findMany({
                where: {
                    chatId: chatId,
                    userId: userId,
                    status: UserChatStatus.OWNER
                }
            });
            if (userChat.length == 0) {
                throw new BadRequestException("User is not the owner of the channel");
            }

            await this.prisma.userChat.deleteMany({
                where: {
                    chatId: chatId
                }
            }).catch((err) => {
                throw new BadRequestException(err);
            });
            const deleted = this.prisma.chat.delete({
                where: {
                    id: chatId
                }
            }).catch((err) => {
                throw new BadRequestException(err);
            });
            return deleted;
        }
    }
}
