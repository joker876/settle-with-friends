import { User as UserEntity } from './../typeorm/entities/User';

declare global {
  namespace Express {
    interface User extends UserEntity {}
  }
}

export { };

