import { Module } from '@nestjs/common';
import { DownloadsService } from './downloads.service';
import { DownloadsController } from './downloads.controller';
import { DownloadsProvider } from './downloads.provider';

@Module({
  providers: [DownloadsService, ...DownloadsProvider],
  controllers: [DownloadsController],
  exports: [DownloadsService],
})
export class DownloadsModule {}
