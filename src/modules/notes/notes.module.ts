import { Module } from '@nestjs/common';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';
import { NotesProvider } from './notes.provider';
import { AwsS3Service } from 'src/config/aws/aws-s3.service';
import { AwsModule } from 'src/config/aws/aws.module';
import { UsersModule } from '../users/users.module';
import { PreviewModule } from '../preview/preview.module';
import { BullModule } from '@nestjs/bullmq';
import { NoteReview } from 'src/config/redis/note-reviews';
import { RedisModule } from 'src/config/redis/redis.module';
import { BookmarksModule } from '../bookmarks/bookmarks.module';

@Module({
  imports: [
    RedisModule,
    AwsModule,
    UsersModule,
    PreviewModule,
    BullModule.registerQueue({
      name: 'note-reviews',
    }),
    BookmarksModule,
  ],
  providers: [NotesService, ...NotesProvider, NoteReview],
  controllers: [NotesController],
})
export class NotesModule {}
