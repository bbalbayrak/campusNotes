import { Test, TestingModule } from '@nestjs/testing';
import { FollowsDepartmentsService } from './follows_departments.service';

describe('FollowsDepartmentsService', () => {
  let service: FollowsDepartmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FollowsDepartmentsService],
    }).compile();

    service = module.get<FollowsDepartmentsService>(FollowsDepartmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
