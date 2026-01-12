import { Test, TestingModule } from '@nestjs/testing';
import { UniGradingSystemService } from './uni-grading-system.service';

describe('UniGradingSystemService', () => {
  let service: UniGradingSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UniGradingSystemService],
    }).compile();

    service = module.get<UniGradingSystemService>(UniGradingSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
