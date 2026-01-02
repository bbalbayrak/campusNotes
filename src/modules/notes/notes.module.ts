import { Module } from '@nestjs/common';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';
import { NotesProvider } from './notes.provider';
import { AwsS3Service } from 'src/config/aws/aws-s3.service';
import { AwsModule } from 'src/config/aws/aws.module';
import { UsersModule } from '../users/users.module';
import { PreviewModule } from '../preview/preview.module';

@Module({
  imports: [AwsModule, UsersModule, PreviewModule],
  providers: [NotesService, ...NotesProvider],
  controllers: [NotesController],
})
export class NotesModule {}
