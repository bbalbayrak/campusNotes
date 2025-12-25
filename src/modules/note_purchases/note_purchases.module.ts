import { Module } from '@nestjs/common';
import { NotePurchasesService } from './note_purchases.service';
import { NotePurchasesController } from './note_purchases.controller';
import { NotePurchasesProvider } from './note_purchases.provider';

@Module({
  providers: [NotePurchasesService, ...NotePurchasesProvider],
  controllers: [NotePurchasesController],
})
export class NotePurchasesModule {}
