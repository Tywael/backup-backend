import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Friendship, User, UserStatus } from '@prisma/client';
import { CreateUserDto, GetUserByIdDto, UpdateUserDto, UserInputDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  remove: any;
  constructor(private prisma: PrismaService) { }

  async findOrCreate(userInputDto: UserInputDto): Promise<any> {
    let user = await this.prisma.user.findUnique({
      where: {
        email: userInputDto.email,
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: userInputDto.email,
          firstName: userInputDto.firstName,
          lastName: userInputDto.lastName,
          fortyTwoId: userInputDto.fortyTwoId,
          pseudo: userInputDto.pseudo,
          avatar: userInputDto.avatar
        },
      });
    } else if (!user.fortyTwoId) {
      user = await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          fortyTwoId: userInputDto.fortyTwoId,
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

  async createUser(data: CreateUserDto): Promise<User> {
    return await this.prisma.user.create({ data });
  }

  async getAllUsers(): Promise<User[]> {
    const findUsers = await this.prisma.user.findMany();

    if (!findUsers) {
      throw new BadRequestException('No users found.');
    }

    return findUsers;
  }

  async getUsersByStatus(status: string, limit: string, currentUserId: string): Promise<User[]> {
    const statusEnum = UserStatus[status];

    const users = await this.prisma.user.findMany({
      where: {
        status: statusEnum,
        id: { not: currentUserId },
      },
      take: limit ? parseInt(limit.toString()) : undefined,
    });

    return users;
  }

  async getUserById(userId: string): Promise<GetUserByIdDto> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { id: userId },
          { pseudo: userId }
        ]
      }
    });

    if (!user) {
      throw new BadRequestException('User not found.');
    }

    const userDto: GetUserByIdDto = {
      id: user.id,
      fortyTwoId: user.fortyTwoId,
      pseudo: user.pseudo,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      about: user.about,
      experience: user.experience,
      status: user.status,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return userDto;
  }

  async updateUser(userId: string, data: UpdateUserDto): Promise<User> {
    return await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async deleteUser(userId: string): Promise<User> {
    return await this.prisma.user.delete({ 
      where: { id: userId } 
    });
  }


  async sendFriendRequest(userId: string, friendId: string): Promise<Friendship> {
    // Check if friendId exists
    const friend = await this.prisma.user.findUnique({
      where: {
        id: friendId,
      },
    });

    if (!friend) {
      throw new BadRequestException('User not found.');
    }

    // Check if already friends
    const isAlreadyFriends = await this.prisma.user.findFirst({
      where: {
        id: userId,
        friends: {
          some: {
            id: friendId,
          },
        },
      },
    });

    if (isAlreadyFriends) {
      throw new BadRequestException('Already friends.');
    }

    // Send friend request
    const friendship = await this.prisma.friendship.create({
      data: {
        userId,
        friendId,
      },
    });

    return friendship;
  }

  // User receiving the requests
  async getFriendRequests(userId: string): Promise<Friendship[]> {
    const friendRequests = await this.prisma.friendship.findMany({
      where: {
        friendId: userId,
        accepted: false,
      },
      include: {
        user: true,
      },
    });
    return friendRequests;
  }

  // User sending the requests
  async getIncomingFriendRequests(userId: string): Promise<Friendship[]> {
    const incomingFriendRequests = await this.prisma.friendship.findMany({
      where: {
        userId: userId,
        accepted: false,
      },
      include: {
        friend: true,
      },
    });
    return incomingFriendRequests;
  }  

  async acceptFriendRequest(userId: string, friendId: string): Promise<Friendship> {
    // Check if friendId exists
    const friend = await this.prisma.user.findUnique({
      where: {
        id: friendId,
      },
    });

    if (!friend) {
      throw new BadRequestException('User not found.');
    }

    // Check if already friends
    const isAlreadyFriends = await this.prisma.user.findFirst({
      where: {
        id: userId,
        friends: {
          some: {
            id: friendId,
          },
        },
      },
    });

    if (isAlreadyFriends) {
      throw new BadRequestException('Already friends.');
    }

    // Accept friend request
    const friendship = await this.prisma.friendship.update({
      where: {
        userId_friendId: {
          userId,
          friendId,
        },
      },
      data: {
        accepted: true,
      },
    });
    return friendship;
  }

  async unfriendUser(userId: string, friendId: string): Promise<Friendship> {
    // Check if friendId exists
    const friend = await this.prisma.user.findUnique({
      where: {
        id: friendId,
      },
    });

    if (!friend) {
      throw new BadRequestException('User not found.');
    }

    // Check if already friends
    const isAlreadyFriends = await this.prisma.user.findFirst({
      where: {
        id: userId,
        friends: {
          some: {
            id: friendId,
          },
        },
      },
    });

    if (!isAlreadyFriends) {
      throw new BadRequestException('Not friends.');
    }

    // Unfriend user
    const friendship = await this.prisma.friendship.delete({
      where: {
        userId_friendId: {
          userId,
          friendId,
        },
      },
    });
    return friendship;
  }

  async getFriends(userId: string): Promise<User[]> {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        userId: userId,
        accepted: true,
      },
      include: {
        friend: true,
      },
    });
    const friends = friendships.map((friendship) => friendship.friend);
    return friends;
  }
}

