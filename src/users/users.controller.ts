import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Patch, UseGuards, Req, Res, Next } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UsersService } from './users.service';
import { User } from '@prisma/client';
import { RequestWithUser } from 'src/interfaces/request-with-user.interface';
import { AuthMiddleware } from './users.middleware';
import { NextFunction, Response } from 'express';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService, 
    private authMiddleware: AuthMiddleware,
  ) {}

  @Get()
  async getAllUsers(@Req() req: RequestWithUser, @Res() res: Response, @Next() next: NextFunction) {
    await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
    const user = req.user;
    if (!user) {
      res.status(401).send({ message: 'Unauthorized' });
    } else {
      const users = await this.usersService.getAllUsers();
      res.send({ users });
    }
  }

  @Get('login')
  async loginUser(@Req() req: RequestWithUser, @Res() res: Response, @Next() next: NextFunction){
    await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
    const user = req.user;
    if (!user) {
      res.status(401).send({ message: 'Unauthorized' });
    } else {
      res.send({ user });
    }
  }


  @Get(':id')
  async getUserById(@Param('id') userId: string, @Req() req: RequestWithUser, @Res() res: Response, @Next() next: NextFunction) {
    await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
    const user = req.user;
    if (!user) {
      res.status(401).send({ message: 'Unauthorized' });
    } else {
      const user = await this.usersService.getUserById(userId);
      res.send({ user });
    }
  }

  @Post()
  async createUser(@Body() data: User): Promise<User> {
    return await this.usersService.createUser(data);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateUser(
    @Param('id', ParseUUIDPipe) userId: string,
    @Body() data: User,
  ): Promise<User> {
    return await this.usersService.updateUser(userId, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) userId: string): Promise<User> {
    return this.usersService.deleteUser(userId);
  }
}