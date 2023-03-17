import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Message } from '@prisma/client';
import { CreateMessageDto } from './dto/messages.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async userExists(id: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return Boolean(user);
  }  

  async findAll(): Promise<Message[]> {
    return this.prisma.message.findMany();
  }

  async findOne(id: string): Promise<Message> {
    return this.prisma.message.findUnique({
      where: {
        id,
      },
    });
  }

  async findByChatId(chatId: string): Promise<Message[]> {
    return this.prisma.message.findMany({
      where: {
        chatId,
      },
    });
  }

  async findByChannelId(channelId: string): Promise<Message[]> {
    const chat = await this.prisma.chat.findUnique({
      where: {
        id: channelId,
      },
      include: {
        messages: true,
      },
    });

    return chat?.messages || [];
  }

  async findByUserId(userId: string): Promise<Message[]> {
    if (!(await this.userExists(userId))) {
      throw new BadRequestException('User does not exist');
    }

    return this.prisma.message.findMany({
      where: {
        userId,
      },
    });
  }
  
  

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    const { chatId, userId, body } = createMessageDto;

    if (!(await this.userExists(userId))) {
      throw new BadRequestException('User does not exist');
    }

    return this.prisma.message.create({
      data: {
        chatId,
        body,
        user: {
          connect: { id: userId },
        },
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.message.delete({
      where: {
        id,
      },
    });
  }
}
