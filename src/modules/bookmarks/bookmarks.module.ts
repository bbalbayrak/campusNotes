import { Module } from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { BookmarksController } from './bookmarks.controller';
import { BookmarksProvider } from './bookmarks.provider';
import { NotesProvider } from '../notes/notes.provider';

@Module({
  providers: [BookmarksService, ...BookmarksProvider, ...NotesProvider],
  controllers: [BookmarksController],
  exports: [BookmarksService],
})
export class BookmarksModule {}
