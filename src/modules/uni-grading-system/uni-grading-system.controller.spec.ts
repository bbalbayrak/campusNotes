import { Test, TestingModule } from '@nestjs/testing';
import { UniGradingSystemController } from './uni-grading-system.controller';

describe('UniGradingSystemController', () => {
  let controller: UniGradingSystemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UniGradingSystemController],
    }).compile();

    controller = module.get<UniGradingSystemController>(UniGradingSystemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
