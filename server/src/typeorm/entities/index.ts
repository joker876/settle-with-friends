import { SessionEntity } from './Session';
import { User } from './User';

export * from './Session';
export * from './User';

export const entities = [User, SessionEntity];
