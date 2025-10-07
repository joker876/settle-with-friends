import { Inject } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { User } from '../../typeorm/entities/User';
import { AuthService } from '../auth.service';

export class SessionSerializer extends PassportSerializer {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {
    super();
  }

  serializeUser(user: User, done: (err: any, id?: number) => void) {
    done(null, user.id);
  }

  deserializeUser(payload: number, done: (err: any, user?: User | null) => void) {
    this.authService
      .findUserById(payload)
      .then(user => done(null, user))
      .catch(err => done(err));
  }
}
