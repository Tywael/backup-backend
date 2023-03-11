import { Controller, Get, Req, Res, UseGuards, ForbiddenException, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { RequestWithUser } from '../interfaces/request-with-user.interface';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma.service';
import axios from 'axios';
import { UserStatus } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private prisma: PrismaService, private usersService: UsersService) {}

  @Get('login')
  @UseGuards(AuthGuard('42'))
  async loginWithFortyTwo(@Res() res: Response) {}

  @Get('login/callback')
  async loginWithFortyTwoCallback(@Req() req: RequestWithUser, @Res() res: Response) {
    const { code } = req.query;
  
    try {
      const tokenResponse = await axios.post('https://api.intra.42.fr/oauth/token', {
        grant_type: 'authorization_code',
        client_id: process.env.FORTY_TWO_CLIENT_ID,
        client_secret: process.env.FORTY_TWO_CLIENT_SECRET,
        code: code,
        redirect_uri: `${process.env.API_URL}/auth/login/callback`,
      });

      const userDataResponse = await axios.get('https://api.intra.42.fr/v2/me', {
        headers: {
          Authorization: `Bearer ${tokenResponse.data.access_token}`,
        },
      });

      const { id, email, first_name, last_name, login, image } = userDataResponse.data;
      const user = await this.authService.findOrCreate({
        id,
        email,
        firstName: first_name,
        lastName: last_name,
        fortyTwoId: id,
        pseudo: login,
        avatar: image.versions.medium
      });

      if (user) {
        // Set user as ONLINE
        this.usersService.updateUserStatus(user.id, UserStatus.ONLINE);
      }

      if (!req.cookies[process.env.JWT_NAME]) {
        const token = this.authService.createToken(user);

        // Check token
        if (!token) {
          throw new ForbiddenException('Forbidden, token is missing.');
        }

        console.log('JWT cookie:', token);
        
        // Set jwt cookie
        res.cookie(process.env.JWT_NAME, token, {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
          maxAge: 86400000, // 1 day
        });
      }
      const redirectUrl = `${process.env.WEB_URL}/login`
      res.status(302).redirect(redirectUrl);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error authenticating with 42 API');
    }
  }

  @Get('signout/:id')
  async logout(@Req() req, @Res({ passthrough: true }) res, @Param() params: { id: string }) {
    // Set user as OFFLINE
    res.clearCookie(process.env.JWT_NAME);
    this.usersService.updateUserStatus(params.id, UserStatus.OFFLINE);
    return this.authService.logout(req, res, params.id);
  }
}
