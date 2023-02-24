import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtService, JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma.service'
import { AuthController } from './auth.controller';
import { FortyTwoStrategy } from './forty-two.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  providers: [
    AuthService,
    FortyTwoStrategy,
    PrismaService,
    JwtService,
  ],
  controllers: [
    AuthController,
  ],
})
export class AuthModule {}
