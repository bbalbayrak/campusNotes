import { Module } from '@nestjs/common';
import { SessionProvider } from './session.provider';
import { SessionService } from './sessions.service';

@Module({
  providers: [...SessionProvider, SessionService],
  exports: [SessionService],
})
export class SessionsModule {}
