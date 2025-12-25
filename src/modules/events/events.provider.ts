import { EVENT_REPOSITORY } from 'src/config/constants';
import { Event } from './events.entity';

export const EventsProvider = [
  {
    provide: EVENT_REPOSITORY,
    useValue: Event,
  },
];
