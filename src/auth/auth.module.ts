import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtService, JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma.service'
import { AuthController } from './auth.controller';
import { FortyTwoStrategy } from './forty-two.strategy';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  providers: [
    AuthService,
    UsersService,
    FortyTwoStrategy,
    PrismaService,
    JwtService,
  ],
  controllers: [
    AuthController,
  ],
})
export class AuthModule {}
