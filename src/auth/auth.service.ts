import { BadRequestException, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async findOrCreate({ id, email, firstName, lastName, pseudo, fortyTwoId}: { id: string, email: string, firstName: string, lastName: string, pseudo: string, fortyTwoId: number}): Promise<any> {
    let user = await this.prisma.user.findUnique({
      where: {
        email: email,
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

  async logout(req: Request, res: Response, id: number) {
    // Find current user
    const findUser = await this.prisma.user.findUnique({
      where: {
        id
      }
    });

    // Check user
    if (!findUser) {
      throw new BadRequestException("User not found.");
    }

    // TODO: set user as offline

    // Delete jwt
    res.clearCookie(process.env.JWT_NAME);
    return res.status(200).send('Sign out succes!');
  }
  
  createToken(user: any) {
    const payload = { email: user.email, sub: user.id};
    return {
      access_token: this.jwtService.sign(
        payload, 
        {
          secret: process.env.JWT_SECRET
        }
      ),
    }
  }
}