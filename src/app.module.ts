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
import { CommentsModule } from './modules/comments/comments.module';
import { EventsModule } from './modules/events/events.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AuditLogsModule } from './modules/audit_logs/audit_logs.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './config/database/database.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { BullModule } from '@nestjs/bullmq';
import { NoteReview } from './config/redis/note-reviews';
import { BookmarksModule } from './modules/bookmarks/bookmarks.module';
import { DownloadPermissionsModule } from './modules/download_permissions/download_permissions.module';
import { DownloadsModule } from './modules/downloads/downloads.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { UserSubscriptionsModule } from './modules/user_subscriptions/user_subscriptions.module';
import { EarningsModule } from './modules/earnings/earnings.module';
import { WithdrawalsModule } from './modules/withdrawals/withdrawals.module';
import { ScheduleModule } from '@nestjs/schedule';
import { UniGradingSystemModule } from './modules/uni-grading-system/uni-grading-system.module';
import { GradingTermsModule } from './modules/grading-terms/grading-terms.module';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT) || 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'note-reviews',
    }),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UsersModule,
    UniversitiesModule,
    DepartmentsModule,
    LecturesModule,
    NotesModule,
    FollowsUsersModule,
    FollowsDepartmentsModule,
    FollowsLecturesModule,
    NotePurchasesModule,
    CommentsModule,
    EventsModule,
    ReportsModule,
    AuditLogsModule,
    AuthModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    BookmarksModule,
    DownloadPermissionsModule,
    DownloadsModule,
    SubscriptionsModule,
    UserSubscriptionsModule,
    EarningsModule,
    WithdrawalsModule,
    UniGradingSystemModule,
    GradingTermsModule,
  ],
  controllers: [AppController, FollowsLecturesController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
