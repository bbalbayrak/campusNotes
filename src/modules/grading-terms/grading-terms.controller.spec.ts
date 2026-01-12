import { Test, TestingModule } from '@nestjs/testing';
import { GradingTermsController } from './grading-terms.controller';

describe('GradingTermsController', () => {
  let controller: GradingTermsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GradingTermsController],
    }).compile();

    controller = module.get<GradingTermsController>(GradingTermsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
