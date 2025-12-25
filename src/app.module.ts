import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { UniversitiesModule } from './modules/universities/universities.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { LecturesModule } from './modules/lectures/lectures.module';
import { NotesModule } from './modules/notes/notes.module';
import { FollowsUsersModule } from './modules/follows_users/follows_users.module';
import { FollowsDepartmentsModule } from './modules/follows_departments/follows_departments.module';
import { FollowsLecturesController } from './modules/follows_lectures/follows_lectures.controller';
import { FollowsLecturesModule } from './modules/follows_lectures/follows_lectures.module';
import { NotePurchasesModule } from './modules/note_purchases/note_purchases.module';

@Module({
  imports: [UsersModule, UniversitiesModule, DepartmentsModule, LecturesModule, NotesModule, FollowsUsersModule, FollowsDepartmentsModule, FollowsLecturesModule, NotePurchasesModule],
  controllers: [AppController, FollowsLecturesController],
  providers: [AppService],
})
export class AppModule {}
