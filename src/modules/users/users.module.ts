import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersProvider } from './users.provider';
import { SessionsModule } from '../auth/sessions/sessions.module';

@Module({
  imports: [SessionsModule],
  providers: [UsersService, ...UsersProvider],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
