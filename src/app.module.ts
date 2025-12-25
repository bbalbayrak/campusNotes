import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { UniversitiesModule } from './modules/universities/universities.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { LecturesModule } from './modules/lectures/lectures.module';
import { NotesModule } from './modules/notes/notes.module';
import { FollowsUsersModule } from './modules/follows_users/follows_users.module';

@Module({
  imports: [UsersModule, UniversitiesModule, DepartmentsModule, LecturesModule, NotesModule, FollowsUsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
