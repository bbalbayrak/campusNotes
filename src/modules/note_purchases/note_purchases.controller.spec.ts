import { Test, TestingModule } from '@nestjs/testing';
import { NotePurchasesController } from './note_purchases.controller';

describe('NotePurchasesController', () => {
  let controller: NotePurchasesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotePurchasesController],
    }).compile();

    controller = module.get<NotePurchasesController>(NotePurchasesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
