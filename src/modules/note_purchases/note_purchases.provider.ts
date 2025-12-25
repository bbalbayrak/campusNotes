import { NOTE_PURCHASE_REPOSITORY } from 'src/config/constants';
import { NotePurchase } from './note_purchases.entity';

export const NotePurchasesProvider = [
  {
    provide: NOTE_PURCHASE_REPOSITORY,
    useValue: NotePurchase,
  },
];
