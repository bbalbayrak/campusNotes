import { Module } from '@nestjs/common';
import { FollowsUsersService } from './follows_users.service';
import { FollowsUsersController } from './follows_users.controller';

@Module({
  providers: [FollowsUsersService],
  controllers: [FollowsUsersController]
})
export class FollowsUsersModule {}
