import { DOWNLOAD_PERMISSION_REPOSITORY } from 'src/config/constants';
import { DownloadPermission } from './permission.entity';

export const DownloadPermissionProvider = [
  {
    provide: DOWNLOAD_PERMISSION_REPOSITORY,
    useValue: DownloadPermission,
  },
];
