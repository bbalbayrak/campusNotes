import { Test, TestingModule } from '@nestjs/testing';
import { FollowsUsersService } from './follows_users.service';

describe('FollowsUsersService', () => {
  let service: FollowsUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FollowsUsersService],
    }).compile();

    service = module.get<FollowsUsersService>(FollowsUsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
