import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOrCreate({ id, email, firstName, lastName, pseudo, fortyTwoId }: { id: string, email: string, firstName: string, lastName: string, pseudo: string, fortyTwoId: number }): Promise<any> {
    let user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          fortyTwoId,
          pseudo,
        },
      });
    } else if (!user.fortyTwoId) {
      user = await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          fortyTwoId,
        },
      });
    }

    return user;
  }

  async createUser(data: User): Promise<User> {
    return await this.prisma.user.create({ data });
  }

  async getAllUsers(): Promise<User[]> {
    return await this.prisma.user.findMany();
  }

  async getUserById(userId: number): Promise<User> {
    return await this.prisma.user.findUnique({ where: { id: userId } });
  }

  async updateUser(userId: number, data: User): Promise<User> {
    return await this.prisma.user.update({ where: { id: userId }, data });
  }

  async deleteUser(userId: number): Promise<User> {
    return await this.prisma.user.delete({ where: { id: userId } });
  }
}
