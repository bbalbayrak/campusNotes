import { Module } from '@nestjs/common';
import { AuthSessionsService } from './auth_sessions.service';
import { AuthSessionsController } from './auth_sessions.controller';

@Module({
  providers: [AuthSessionsService],
  controllers: [AuthSessionsController]
})
export class AuthSessionsModule {}
