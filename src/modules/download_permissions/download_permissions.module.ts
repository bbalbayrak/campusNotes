import { Module } from '@nestjs/common';
import { DownloadPermissionsService } from './download_permissions.service';
import { DownloadPermissionsController } from './download_permissions.controller';

@Module({
  providers: [DownloadPermissionsService],
  controllers: [DownloadPermissionsController]
})
export class DownloadPermissionsModule {}
