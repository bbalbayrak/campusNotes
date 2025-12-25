import { Test, TestingModule } from '@nestjs/testing';
import { FollowsDepartmentsController } from './follows_departments.controller';

describe('FollowsDepartmentsController', () => {
  let controller: FollowsDepartmentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FollowsDepartmentsController],
    }).compile();

    controller = module.get<FollowsDepartmentsController>(FollowsDepartmentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
