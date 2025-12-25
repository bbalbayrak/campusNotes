import { Test, TestingModule } from '@nestjs/testing';
import { FollowsLecturesService } from './follows_lectures.service';

describe('FollowsLecturesService', () => {
  let service: FollowsLecturesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FollowsLecturesService],
    }).compile();

    service = module.get<FollowsLecturesService>(FollowsLecturesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
