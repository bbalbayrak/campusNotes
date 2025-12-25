import { Module } from '@nestjs/common';
import { NotePurchasesService } from './note_purchases.service';
import { NotePurchasesController } from './note_purchases.controller';

@Module({
  providers: [NotePurchasesService],
  controllers: [NotePurchasesController]
})
export class NotePurchasesModule {}
