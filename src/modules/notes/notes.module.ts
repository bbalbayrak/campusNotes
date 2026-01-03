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

@Module({
  imports: [
    AwsModule,
    UsersModule,
    PreviewModule,
    BullModule.registerQueue({
      name: 'note-reviews',
    }),
  ],
  providers: [NotesService, ...NotesProvider, NoteReview],
  controllers: [NotesController],
})
export class NotesModule {}
