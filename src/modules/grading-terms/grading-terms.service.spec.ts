import { Test, TestingModule } from '@nestjs/testing';
import { GradingTermsService } from './grading-terms.service';

describe('GradingTermsService', () => {
  let service: GradingTermsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GradingTermsService],
    }).compile();

    service = module.get<GradingTermsService>(GradingTermsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
