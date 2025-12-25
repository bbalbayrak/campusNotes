import { Test, TestingModule } from '@nestjs/testing';
import { FollowsLecturesController } from './follows_lectures.controller';

describe('FollowsLecturesController', () => {
  let controller: FollowsLecturesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FollowsLecturesController],
    }).compile();

    controller = module.get<FollowsLecturesController>(FollowsLecturesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
