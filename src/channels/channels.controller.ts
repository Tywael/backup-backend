import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Patch, UseGuards, Req, Res} from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { Chat, User } from '@prisma/client';
import { AuthMiddleware } from 'src/users/users.middleware';
import { NextFunction, Response } from 'express';
import { RequestWithUser } from 'src/interfaces/request-with-user.interface';
import { resolve } from 'path';

@Controller('channels')
export class ChannelsController {
    constructor(
        private channelsService: ChannelsService,
        private authMiddleware: AuthMiddleware,
        ) {}

    @Get()
    async getAllChannels(@Req() req: RequestWithUser, @Res() res: Response) {
        await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
        const user = req.user;
        if (!user) {
            res.status(401).send({ message: 'unauthorized' });
        } else {
            const channels = await this.channelsService.getAllChannels();
            res.send({ channels });
        }
    }

    @Get('@me')
    async getMyAllChannels(@Req() req: RequestWithUser, @Res() res: Response) {
        await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
        const user = req.user;
        if (!user) {
            res.status(401).send({ message: 'unauthorized' });
        } else {
            const channels = await this.channelsService.getChannelsByUser(user.id);
            res.send({ channels });
        }
    }

    @Get(':channelid')
    async getChannelsById(@Param('channelid', ParseUUIDPipe) channelId: string): Promise<Chat> {
        return await this.channelsService.getChannelById(channelId);
    }

    @Post('create')
    async createChat(@Body() data, @Req() req: RequestWithUser, @Res() res: Response) {
        await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
        const user = req.user;
        if (!user) {
            res.status(401).send({ message: 'unauthorized' });
        } else {
            const channel = await this.channelsService.createChannel({ userId: user.id });
            res.send({ channel });
        }
    }

    @Post('join')
    async joinChannel(@Body() data: { chatid: string }, @Req() req: RequestWithUser, @Res() res: Response) {
        await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
        const user = req.user;
        if (!user) {
            res.status(401).send({ message: 'unauthorized' });
        } else {
            const channel = await this.channelsService.joinChannel(data.chatid, user.id);
            res.send({ channel });
        }
    }

    @Patch(':id')
    async updateChat(
        @Param('id', ParseUUIDPipe) channelId: string,
        @Body() data: Chat,
    ): Promise<Chat> {
        return await this.channelsService.updateChannel(channelId, data);
    }

    @Delete(':channelid')
    async deleteChannel(@Param('channelid', ParseUUIDPipe) chatId: string, @Req() req: RequestWithUser, @Res() res: Response) {      
        await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
        const user = req.user;
        if (!user) {
          res.status(401).send({ message: 'Unauthorized' });
        } else {
          const chats =  await this.channelsService.deletechanel(chatId, user.id);
          res.send({ chats });
        }
    }
}
