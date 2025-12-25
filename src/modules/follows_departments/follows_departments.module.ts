import { Module } from '@nestjs/common';
import { FollowsDepartmentsService } from './follows_departments.service';
import { FollowsDepartmentsController } from './follows_departments.controller';
import { FollowsDepartmentsProvider } from './follows_departments.provider';

@Module({
  providers: [FollowsDepartmentsService, ...FollowsDepartmentsProvider],
  controllers: [FollowsDepartmentsController],
})
export class FollowsDepartmentsModule {}
