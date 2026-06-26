import { Inject, Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { User } from '../../../typeorm/entities';
import { AuthService } from '../auth.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {
    super();
  }

  serializeUser(user: User, done: (err: Error | null, user: any) => void) {
    done(null, user);
  }

  async deserializeUser(payload: any, done: (err: Error | null, user: any) => void) {
    const user = await this.authService.findUser(payload.id);
    return user ? done(null, user) : done(null, null);
  }
}
