import { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE, DEVELOPMENT, TEST, PRODUCTION } from '../constants';
import { databaseConfig } from './database.config';
import { User } from 'src/modules/users/users.entity';
import { AuthSession } from 'src/modules/auth/sessions/session.entity';
import { University } from 'src/modules/universities/universities.entity';
import { Department } from 'src/modules/departments/departments.entity';
import { Lecture } from 'src/modules/lectures/lectures.entity';
import { Note } from 'src/modules/notes/notes.entity';
import { FollowsUsers } from 'src/modules/follows_users/follows_users.entity';
import { FollowLecture } from 'src/modules/follows_lectures/follow_lectures.entity';
import { FollowsDepartments } from 'src/modules/follows_departments/follows_departments.entity';
import { NoteBookmark } from 'src/modules/bookmarks/bookmarks.entity';
import { Downloads } from 'src/modules/downloads/downloads.entity';
import { NotePurchase } from 'src/modules/note_purchases/note_purchases.entity';
import { Earnings } from 'src/modules/earnings/earnings.entity';
import { DownloadPermission } from 'src/modules/download_permissions/permission.entity';
import { Subscriptions } from 'src/modules/subscriptions/subscriptions.entity';
import { UserSubscription } from 'src/modules/user_subscriptions/user_subscriptions.entity';
import { Withdrawal } from 'src/modules/withdrawals/withdrawals.entity';

export const databaseProviders = [
  {
    provide: SEQUELIZE,
    useFactory: async () => {
      let config;
      switch (process.env.NODE_ENV as any) {
        case DEVELOPMENT:
          config = databaseConfig.development;
          break;
        case TEST:
          config = databaseConfig.test;
          break;
        case PRODUCTION:
          config = databaseConfig.production;
          break;
        default:
          config = databaseConfig.development;
      }
      const sequelize = new Sequelize(config);

      sequelize.addModels([
        User,
        AuthSession,
        University,
        Department,
        Lecture,
        Note,
        FollowsUsers,
        FollowLecture,
        FollowsDepartments,
        NoteBookmark,
        Downloads,
        NotePurchase,
        Earnings,
        DownloadPermission,
        Subscriptions,
        UserSubscription,
        Withdrawal,
      ]);

      await sequelize.sync();
      return sequelize;
    },
  },
];
