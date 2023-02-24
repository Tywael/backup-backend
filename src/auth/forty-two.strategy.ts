import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { AuthService } from './auth.service';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
  constructor(private authService: AuthService) {
    super({
      authorizationURL: 'https://api.intra.42.fr/oauth/authorize',
      tokenURL: 'https://api.intra.42.fr/oauth/token',
      clientID: process.env.FORTY_TWO_CLIENT_ID,
      clientSecret: process.env.FORTY_TWO_CLIENT_SECRET,
      callbackURL: `${process.env.APP_URL}/auth/login/callback`,
      scope: ['public'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: (err: any, user: any, info?: any) => void) {
    const { id, email, first_name, last_name, login, forty_two_id } = profile;
    const user = await this.authService.findOrCreate({
      id,
      email,
      fortyTwoId: forty_two_id,
      firstName: first_name,
      lastName: last_name,
      pseudo: login,
    });
    done(null, user);
  }
}
