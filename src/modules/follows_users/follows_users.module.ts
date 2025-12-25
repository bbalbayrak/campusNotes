import { Module } from '@nestjs/common';
import { FollowsUsersService } from './follows_users.service';
import { FollowsUsersController } from './follows_users.controller';
import { FollowsUsersProvider } from './follows_users.provider';

@Module({
  providers: [FollowsUsersService, ...FollowsUsersProvider],
  controllers: [FollowsUsersController],
})
export class FollowsUsersModule {}
