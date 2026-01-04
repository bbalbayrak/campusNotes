import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { JwtAuthGuard } from '../auth/passport/jwt.guard';
import { Request, Response } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Post('toggle/:noteId')
  @HttpCode(HttpStatus.CREATED)
  async toggleBookmark(
    @Param('noteId', ParseIntPipe) noteId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const currentUserId = req['user'].userId;
    const result = await this.bookmarksService.toggleBookmark(
      currentUserId,
      noteId,
    );
    return res.json({ message: 'Bookmark status updated', data: result });
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getUserBookmarks(@Req() req: Request, @Res() res: Response) {
    const currentUserId = req['user'].userId;
    const bookmarks =
      await this.bookmarksService.getUserBookmarks(currentUserId);
    return res.json({ message: 'User bookmarks retrieved', data: bookmarks });
  }
}
