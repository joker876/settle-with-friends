import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile as GoogleProfile, Strategy } from 'passport-google-oauth20';
import { UserDetails } from '../../shared/UserDetails';
import { User } from '../../typeorm/entities/User';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: GoogleProfile): Promise<User | null> {
    const email = profile.emails?.[0].value;
    if (!email) {
      return null;
    }

    const userData: UserDetails = {
      email,
      displayName: profile.displayName,
      photo: profile.photos?.[0].value,
    };

    const user = await this.authService.validateUser(userData);

    return user;
  }
}
