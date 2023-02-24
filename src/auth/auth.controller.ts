import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { RequestWithUser } from '../interfaces/request-with-user.interface';
import { AuthService } from './auth.service';
import axios from 'axios';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('42')
  @UseGuards(AuthGuard('42'))
  async loginWithFortyTwo(@Res() res: Response) {
    const redirectUrl = 'https://api.intra.42.fr/oauth/authorize' +
      `?client_id=${process.env.FORTY_TWO_CLIENT_ID}` +
      `&redirect_uri=${process.env.APP_URL}/auth/42/callback` +
      `&response_type=code`;
    res.redirect(redirectUrl);
  }

  @Get('42/callback')
  @UseGuards(AuthGuard('42'))
  async loginWithFortyTwoCallback(@Req() req: RequestWithUser, @Res() res: Response) {
    const { code } = req.query;
  
    try {
      const tokenResponse = await axios.post('https://api.intra.42.fr/oauth/token', {
        grant_type: 'authorization_code',
        client_id: process.env.FORTY_TWO_CLIENT_ID,
        client_secret: process.env.FORTY_TWO_CLIENT_SECRET,
        code,
        redirect_uri: `${process.env.APP_URL}/auth/42/callback`,
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
        pseudo: login,
      });

      const token = this.authService.createToken(user);
      res.cookie(process.env.JWT_NAME, token, { httpOnly: true });
      res.redirect(process.env.APP_URL);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error authenticating with 42 API');
    }
  }
}
