import { Module } from '@nestjs/common';
import { FollowsDepartmentsService } from './follows_departments.service';
import { FollowsDepartmentsController } from './follows_departments.controller';

@Module({
  providers: [FollowsDepartmentsService],
  controllers: [FollowsDepartmentsController]
})
export class FollowsDepartmentsModule {}
