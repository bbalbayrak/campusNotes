import { Test, TestingModule } from '@nestjs/testing';
import { DownloadPermissionsController } from './download_permissions.controller';

describe('DownloadPermissionsController', () => {
  let controller: DownloadPermissionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DownloadPermissionsController],
    }).compile();

    controller = module.get<DownloadPermissionsController>(DownloadPermissionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
