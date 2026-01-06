import { DOWNLOAD_REPOSITORY } from 'src/config/constants';
import { Downloads } from './downloads.entity';

export const DownloadsProvider = [
  {
    provide: DOWNLOAD_REPOSITORY,
    useValue: Downloads,
  },
];
