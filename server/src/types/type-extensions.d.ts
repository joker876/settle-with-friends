import { User as UserEntity } from '../typeorm/entities/User';

declare global {
  namespace Express {
    interface User extends UserEntity {}
  }
}
declare module 'express-session' {
  interface SessionData {
    redirectUrl?: string;
  }
}

export { };

