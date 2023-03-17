import { Controller, Get, Post, Put, Delete, Body, Param  } from '@nestjs/common';
import { Message } from '@prisma/client';
import { MessagesService } from './messages.service';
import { ApiTags, ApiOkResponse, ApiResponse } from '@nestjs/swagger';
import { AuthMiddleware } from 'src/users/users.middleware';
import { CreateMessageDto } from './dto/messages.dto';


@Controller('messages')
@ApiTags('Messages')
export class MessagesController {
  constructor(
    public messagesService: MessagesService,
    private authMiddleware: AuthMiddleware,
    ) {}

    @Get()
    async findAll(): Promise<Message[]> {
      return this.messagesService.findAll();
    }
  
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Message> {
      return this.messagesService.findOne(id);
    }

    @Get('chat/:id')
    async findByChatId(@Param('id') id: string): Promise<Message[]> {
        return this.messagesService.findByChatId(id);
    }

    @Get('channel/:id')
    async findByChannelId(@Param('id') id: string): Promise<Message[]> {
        return this.messagesService.findByChannelId(id);
    }

    @Get('user/:id')
    async findByUserId(@Param('id') id: string): Promise<Message[]> {
        return this.messagesService.findByUserId(id);
    }
  
    @Post()
    @ApiOkResponse({ type: CreateMessageDto })
    async create(@Body() createMessageDto: CreateMessageDto): Promise<Message> {
        return this.messagesService.create(createMessageDto);
    }
  
    @Delete(':id')
    async delete(@Param('id') id: string): Promise<void> {
      return this.messagesService.delete(id);
    }
}