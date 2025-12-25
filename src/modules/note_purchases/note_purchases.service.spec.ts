import { Test, TestingModule } from '@nestjs/testing';
import { NotePurchasesService } from './note_purchases.service';

describe('NotePurchasesService', () => {
  let service: NotePurchasesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotePurchasesService],
    }).compile();

    service = module.get<NotePurchasesService>(NotePurchasesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
