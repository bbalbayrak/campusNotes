import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventsProvider } from './events.provider';

@Module({
  providers: [EventsService, ...EventsProvider],
  controllers: [EventsController],
})
export class EventsModule {}
