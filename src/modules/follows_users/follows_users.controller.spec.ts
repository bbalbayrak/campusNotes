import { Test, TestingModule } from '@nestjs/testing';
import { FollowsUsersController } from './follows_users.controller';

describe('FollowsUsersController', () => {
  let controller: FollowsUsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FollowsUsersController],
    }).compile();

    controller = module.get<FollowsUsersController>(FollowsUsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
