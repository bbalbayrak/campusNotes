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
import { FollowsDepartmentsService } from './follows_departments.service';
import { JwtAuthGuard } from '../auth/passport/jwt.guard';
import { Request, Response } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('follow-departments')
export class FollowsDepartmentsController {
  constructor(
    private readonly followsDepartmentsService: FollowsDepartmentsService,
  ) {}

  @Post('follow/:departmentId')
  @HttpCode(HttpStatus.CREATED)
  async followDepartment(
    @Param('departmentId', ParseIntPipe) departmentId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const currentUserId = req['user'].userId;
    const follow = await this.followsDepartmentsService.followDepartment(
      currentUserId,
      departmentId,
    );
    return res.json({
      message: 'Department followed successfully',
      data: follow,
    });
  }

  @Delete('unfollow/:departmentId')
  @HttpCode(HttpStatus.OK)
  async unfollowDepartment(
    @Param('departmentId', ParseIntPipe) departmentId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const currentUserId = req['user'].userId;
    await this.followsDepartmentsService.unfollowDepartment(
      currentUserId,
      departmentId,
    );
    return res.json({
      message: 'Department unfollowed successfully',
    });
  }

  @Get('followedDepartments')
  @HttpCode(HttpStatus.OK)
  async getMyFollowedDepartments(@Res() res: Response, @Req() req: Request) {
    const currentUserId = req['user'].userId;
    const followedDepartments =
      await this.followsDepartmentsService.getMyFollowedDepartments(
        currentUserId,
      );
    return res.json({
      message:
        followedDepartments.length > 0
          ? 'Followed departments fetched successfully'
          : 'No followed departments found',
      data: followedDepartments,
    });
  }
}
