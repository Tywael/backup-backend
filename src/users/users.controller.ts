import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Patch, UseGuards, Req, Res, Next } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '@prisma/client';
import { RequestWithUser } from 'src/interfaces/request-with-user.interface';
import { AuthMiddleware } from './users.middleware';
import { NextFunction, Response } from 'express';
import { ApiTags, ApiOkResponse, ApiResponse } from '@nestjs/swagger';
import { UserDto } from './dto/user.dto';
import { FriendRequestDto, FriendUpdateDto } from './dto/friendship.dto';

@Controller('users')
@ApiTags('Users')
@ApiResponse({ status: 401, description: 'Unauthorized' })
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authMiddleware: AuthMiddleware,
  ) { }

  @Get()
  async getAllUsers(
    @Req() req: RequestWithUser, 
    @Res() res: Response, 
    @Next() next: NextFunction) {
    await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
    if (!req.user) {
      res.status(401).send({ message: 'Unauthorized' });
    } else {
      let users = await this.usersService.getAllUsers();
      res.send({ users });
    }
  }

  @Get('login')
  @ApiOkResponse({ type: UserDto })
  async loginUser(
    @Param('login') login: string,
    @Req() req: RequestWithUser, 
    @Res() res: Response, 
    @Next() next: NextFunction
  ) {
    await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
    const user = req.user;
    if (!user) {
      res.status(401).send({ message: 'Unauthorized' });
    } else {
      res.send({ user });
    }
  }

  @Get(':id')
  @ApiOkResponse({ type: UserDto })
  async getUserById(
    @Param('id') userId: string,
    @Req() req: RequestWithUser, 
    @Res() res: Response, 
    @Next() next: NextFunction
  ) {
    await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
    if (!req.user) {
      res.status(401).send({ message: 'Unauthorized' });
    } else {
      let user = await this.usersService.getUserById(userId);
      res.send({ user });
    }
  }

  @Get(':status/:limit')
  @ApiOkResponse({ type: UserDto })
  async getUserByStatus(
    @Param('status') status: string,
    @Param('limit') limit: string, 
    @Req() req: RequestWithUser, 
    @Res() res: Response, 
    @Next() next: NextFunction
  ) {
    await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
    if (!req.user) {
      res.status(401).send({ message: 'Unauthorized' });
    } else {
      let users = await this.usersService.getUsersByStatus(status, limit, req.user.id);
      res.send({ users });
    }
  }

  @Post()
  async createUser(@Body() data: UserDto): Promise<User> {
    return await this.usersService.createUser(data);
  }

  @Patch(':id/edit')
  @ApiOkResponse({ type: UserDto })
  async updateUser(
    @Param('id', ParseUUIDPipe) userId: string,
    @Body() data: UserDto,
    @Req() req: RequestWithUser, 
    @Res() res: Response, 
    @Next() next: NextFunction
  ) {
    await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
    if (!req.user) {
      res.status(401).send({ message: 'Unauthorized' });
    } else {
      if (req.user.id === userId || req.user.role === 'ADMIN') {
        let user = await this.usersService.updateUser(userId, data);
        res.send({ user });
      } else {
        res.status(401).send({ message: 'Unauthorized' });
      }
    }
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) userId: string,
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response, 
    @Next() next: NextFunction
  ) {
    await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
    if (req.user) {
      res.status(401).send({ message: 'Unauthorized' });
    } else {
      if (req.user.id === userId || req.user.role === 'ADMIN') {
        await this.usersService.deleteUser(userId);
        res.clearCookie(process.env.JWT_NAME);
        res.send({ message: 'User deleted' });
      } else {
        res.status(401).send({ message: 'Unauthorized' });
      }
    }
  }

  // Friendship routes
  @Post(':id/friend-request')
  @ApiOkResponse({ type: FriendRequestDto })
  async sendFriendRequest(
    @Param('id') userId: string, 
    @Body() friendRequestDto: FriendRequestDto,
    @Req() req: RequestWithUser, 
    @Res({ passthrough: true }) res: Response, 
    @Next() next: NextFunction
  ) {
    await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
    if (!req.user) {
      res.status(401).send({ message: 'Unauthorized' });
    } else {
      if (req.user.id !== userId) {
        let user = await this.usersService.sendFriendRequest(userId, req.user.id);
        res.send({ user });
      } else {
        res.status(401).send({ message: 'Unauthorize to send friend request to yourself' });
      }
    }
  }

  @Patch(':id/accept-friend-request')
  @ApiOkResponse({ type: FriendUpdateDto })
  async acceptFriendRequest(
    @Param('id') userId: string, 
    @Body() friendUpdateDto: FriendUpdateDto,
    @Req() req: RequestWithUser, 
    @Res({ passthrough: true }) res: Response, 
    @Next() next: NextFunction
  ) {
    await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
    if (!req.user) {
      res.status(401).send({ message: 'Unauthorized' });
    } else {
      if (req.user.id !== userId) {
        let user = await this.usersService.acceptFriendRequest(userId, req.user.id);
        res.send({ user });
      } else {
        res.status(401).send({ message: 'Unauthorize to accept friend request from yourself' });
      }
    }
  }

  @Post(':id/unfriend')
  @ApiOkResponse({ type: FriendRequestDto })
  async unfriendUser(
    @Param('id') userId: string, 
    @Body() friendRequestDto: FriendRequestDto,
    @Req() req: RequestWithUser, 
    @Res({ passthrough: true }) res: Response, 
    @Next() next: NextFunction
  ) {
    await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
    if (!req.user) {
      res.status(401).send({ message: 'Unauthorized' });
    } else {
      if (req.user.id !== userId) {
        let user = await this.usersService.unfriendUser(userId, req.user.id);
        res.send({ user });
      } else {
        res.status(401).send({ message: 'Unauthorize to unfriend yourself' });
      }
    }
  }
}