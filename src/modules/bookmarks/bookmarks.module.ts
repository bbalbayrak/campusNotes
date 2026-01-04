import { Module } from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { BookmarksController } from './bookmarks.controller';
import { BookmarksProvider } from './bookmarks.provider';

@Module({
  providers: [BookmarksService, ...BookmarksProvider],
  controllers: [BookmarksController],
})
export class BookmarksModule {}
