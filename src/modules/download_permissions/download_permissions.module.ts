import { Module } from '@nestjs/common';
import { DownloadPermissionsService } from './download_permissions.service';
import { DownloadPermissionsController } from './download_permissions.controller';
import { DownloadPermissionProvider } from './permission.provider';

@Module({
  providers: [DownloadPermissionsService, ...DownloadPermissionProvider],
  controllers: [DownloadPermissionsController],
})
export class DownloadPermissionsModule {}
