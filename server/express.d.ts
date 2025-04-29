import { User } from '../shared/schema';

declare global {
  namespace Express {
    interface User extends Omit<User, 'password'> {
      id: number;
    }

    interface Request {
      user?: User;
    }
  }
}