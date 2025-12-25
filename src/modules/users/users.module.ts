import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersProvider } from './users.provider';

@Module({
  providers: [UsersService, ...UsersProvider],
  controllers: [UsersController],
})
export class UsersModule {}
