import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Chat, ChatType, User } from '@prisma/client';
import { UsersService } from '../users/users.service';

@Injectable()
export class ChatsService {
    remove: any;
    constructor(
        private prisma: PrismaService,
        private usersService: UsersService
        ) {}

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
        return await this.prisma.chat.findUnique({ 
            where: { 
                id: chatId 
            } 
        });        
    }

    async getChatByUser(userTofindId: string): Promise<Chat[] | null> {
        let chatUser = await this.prisma.userChat.findMany({
          where: {
            userId: userTofindId
          }
        })
        const chats = await this.prisma.chat.findMany({ 
          where: { 
            id: { 
              in: chatUser.map((userChat) => userChat.chatId) 
            } 
          },
          include: {
            users: true
          }
        });
        
        // Get all user ids from the chats
        const userIds = chats.reduce((acc, chat) => {
          chat.users.forEach(user => {
            if (!acc.includes(user.userId)) {
              acc.push(user.userId)
            }
          })
          return acc
        }, [])
      
        // Query users by their ids
        const users = await this.prisma.user.findMany({
          where: {
            id: {
              in: userIds
            }
          }
        })
      
        // Map user details to each chat object
        const result = chats.map(chat => {
          const chatUsers = chat.users.map(chatUser => {
            const user = users.find(u => u.id === chatUser.userId)
            return {
              ...chatUser,
              user
            }
          })
          return {
            ...chat,
            users: chatUsers
          }
        })
      
        return result
      }      

    async createChat({ user1Id, user2Id }: { user1Id: string, user2Id: string }): Promise<Chat | void> {
        if (!user1Id || !user2Id || (user1Id == user2Id)) {
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
                return null;
            });

            await this.prisma.userChat.create({ 
                data: {
                    userId: user2Id,
                    chatId: chat.id,
                }
            }).catch((err) => {
                console.log(err);
                return null;
            });
        return chat;      
    }

    async updateChat(chatId: string, data: Chat): Promise<Chat> {
        return await this.prisma.chat.update({ where: { id: chatId }, data });
    }

    async deleteChat(chatId: string, userId: string): Promise<Chat | null> {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId
            }
        }).catch((err) => {
            throw new BadRequestException(err);
        });

        if (user.role != "ADMIN") {
            throw new BadRequestException("User is not an admin");
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
