import { Module } from '@nestjs/common';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';
import { NotesProvider } from './notes.provider';

@Module({
  providers: [NotesService, ...NotesProvider],
  controllers: [NotesController],
})
export class NotesModule {}
