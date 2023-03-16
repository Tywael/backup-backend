import { BadRequestException, Injectable } from '@nestjs/common';
import { Friendship, User } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class FriendsService {
    constructor(private prisma: PrismaService) { }
    
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
        const isAlreadyFriends = await this.prisma.friendship.findUnique({
          where: {
            userId_friendId: {
              userId,
              friendId,
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
    
      // User sending the requests
      async getFriendRequests(userId: string): Promise<Friendship[]> {
        const friendRequests = await this.prisma.friendship.findMany({
            where: {
                userId: userId,
                accepted: false,
            },
            include: {
                friend: true,
            },
        });
        return friendRequests;
    }
    
      // User receiving the requests
      async getIncomingFriendRequests(userId: string): Promise<Friendship[]> {
        const incomingFriendRequests = await this.prisma.friendship.findMany({
          where: {
            friendId: userId,
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
        const isAlreadyFriends = await this.prisma.friendship.findUnique({
          where: {
            userId_friendId: {
              userId,
              friendId,
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
        const isAlreadyFriends = await this.prisma.friendship.findUnique({
          where: {
            userId_friendId: {
              userId,
              friendId,
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

      async getFriendship(userId: string, friendId: string): Promise<Friendship> {
        const friendship = await this.prisma.friendship.findUnique({
          where: {
            userId_friendId: {
              userId,
              friendId,
            },
          },
        });

        // return if accepted is true
        return friendship;
      }
}