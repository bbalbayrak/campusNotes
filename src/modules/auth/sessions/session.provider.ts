import { AUTH_SESSION_REPOSITORY } from 'src/config/constants';
import { AuthSession } from './session.entity';

export const SessionProvider = [
  {
    provide: AUTH_SESSION_REPOSITORY,
    useValue: AuthSession,
  },
];
