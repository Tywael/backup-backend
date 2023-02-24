import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async findOrCreate({ id, email, firstName, lastName, pseudo }: { id: string, email: string, firstName: string, lastName: string, pseudo: string }): Promise<any> {
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
          fortyTwoId: id,
          pseudo,
        },
      });
    } else if (!user.fortyTwoId) {
      user = await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          fortyTwoId: id,
        },
      });
    }
  
    return user;
  }
  
  createToken(user: any) {
    const payload = { email: user.email, sub: user.id};
    return this.jwtService.sign(payload);
  }
}
