import { Controller, Get, Req, Res, UseGuards, ForbiddenException, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { RequestWithUser } from '../interfaces/request-with-user.interface';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma.service';
import axios from 'axios';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private prisma: PrismaService) {}

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
        redirect_uri: `${process.env.APP_URL}/auth/login/callback`,
      });

      const userDataResponse = await axios.get('https://api.intra.42.fr/v2/me', {
        headers: {
          Authorization: `Bearer ${tokenResponse.data.access_token}`,
        },
      });

      const { id, email, first_name, last_name, login } = userDataResponse.data;
      const user = await this.authService.findOrCreate({
        id,
        email,
        firstName: first_name,
        lastName: last_name,
        fortyTwoId: id,
        pseudo: login,
      });

      const token = this.authService.createToken(user);

      // Check tocken
      if (!token) {
        throw new ForbiddenException('Forvidden, token is missing.');
      }

      res.cookie(process.env.JWT_NAME, token, { httpOnly: true });
      return res.status(200).send({
        msg: "OAuth success!",
        data: user,
        token
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error authenticating with 42 API');
    }
  }

  @Get('signout/:id')
  async logout(@Req() req, @Res() res, @Param() params: { id: number }) {
    return this.authService.logout(req, res, Number(params.id));
  }
}
