import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { User, UserStatus } from '@prisma/client';

@Injectable()
export class UsersService {
  remove: any;
  constructor(private prisma: PrismaService) {}

  async findOrCreate({ id, email, firstName, lastName, pseudo, fortyTwoId, avatar }: { id: string, email: string, firstName: string, lastName: string, pseudo: string, fortyTwoId: number, avatar: string }): Promise<any> {
    let user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (user) {
      user.experience = user.experience as unknown as bigint;
    }

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          fortyTwoId,
          pseudo,
          avatar
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

  async findUserById(id: string): Promise<any> {
    const findUser = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!findUser) {
      throw new BadRequestException('User not found.');
    }

    return findUser;
  }

  async updateUserStatus(userId: string, status: UserStatus): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { status },
    });
    return user;
  }

  async createUser(data: User): Promise<User> {
    return await this.prisma.user.create({ data });
  }

  async getAllUsers(): Promise<User[]> {
    return await this.prisma.user.findMany();
  }

  async getUserById(userId: string): Promise<User> {
    return await this.prisma.user.findUnique({ where: { id: userId } });
  }

  async updateUser(userId: string, data: User): Promise<User> {
    return await this.prisma.user.update({ where: { id: userId }, data });
  }

  async deleteUser(userId: string): Promise<User> {
    return await this.prisma.user.delete({ where: { id: userId } });
  }
}
