import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UsersService } from './users.service';
import { User } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllUsers(): Promise<User[]> {
    return await this.usersService.getAllUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUserById(@Param('id', ParseUUIDPipe) userId: string): Promise<User> {
    return await this.usersService.getUserById(userId);
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