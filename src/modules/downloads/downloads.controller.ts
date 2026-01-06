import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/passport/jwt.guard';
import { DownloadsService } from './downloads.service';
import { Request, Response } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('downloads')
export class DownloadsController {
  constructor(private readonly downloadsService: DownloadsService) {}

  @Get('my')
  @HttpCode(HttpStatus.OK)
  async getMyDownloads(@Req() req: Request, @Res() res: Response) {
    const userId = req['user'].userId;
    const downloadedNotes =
      await this.downloadsService.getUsersDownloadedNotes(userId);

    return res.json({
      message: 'Downloaded notes retrieved successfully',
      data: downloadedNotes,
    });
  }
}
