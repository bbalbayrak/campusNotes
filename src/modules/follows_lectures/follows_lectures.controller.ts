import {
  Controller,
  Delete,
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
import { FollowsLecturesService } from './follows_lectures.service';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/passport/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('follow-lectures')
export class FollowsLecturesController {
  constructor(
    private readonly followsLecturesService: FollowsLecturesService,
  ) {}

  @Post('follow/:lectureId')
  @HttpCode(HttpStatus.CREATED)
  async followLecture(
    @Param('lectureId', ParseIntPipe) lectureId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const currentUserId = req['user'].userId;

    const follow = await this.followsLecturesService.followLecture(
      currentUserId,
      lectureId,
    );
    return res.json({
      message: 'Lecture followed successfully',
      data: follow,
    });
  }

  @Delete('unfollow/:lectureId')
  @HttpCode(HttpStatus.OK)
  async unfollowLecture(
    @Param('lectureId', ParseIntPipe) lectureId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const currentUserId = req['user'].userId;
    await this.followsLecturesService.unfollowLecture(currentUserId, lectureId);
    return res.json({
      message: 'Lecture unfollowed successfully',
    });
  }

  @Get('followedLectures')
  @HttpCode(HttpStatus.OK)
  async getMyFollowedLectures(@Res() res: Response, @Req() req: Request) {
    const currentUserId = req['user'].userId;
    const followedLectures =
      await this.followsLecturesService.getMyFollowedLectures(currentUserId);
    return res.json({
      message:
        followedLectures.length > 0
          ? 'Followed lectures fetched successfully'
          : 'No followed lectures found',
      data: followedLectures,
    });
  }
}
