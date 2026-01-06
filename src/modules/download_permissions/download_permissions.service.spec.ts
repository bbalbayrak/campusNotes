import { Test, TestingModule } from '@nestjs/testing';
import { DownloadPermissionsService } from './download_permissions.service';

describe('DownloadPermissionsService', () => {
  let service: DownloadPermissionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DownloadPermissionsService],
    }).compile();

    service = module.get<DownloadPermissionsService>(DownloadPermissionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
