import {
  Controller,
  Delete,
  ForbiddenException,
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
import { FollowsUsersService } from './follows_users.service';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/passport/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('follow-users')
export class FollowsUsersController {
  constructor(private readonly followsUsersService: FollowsUsersService) {}

  @Get('following')
  @HttpCode(HttpStatus.OK)
  async getUsersFollowing(@Res() res: Response, @Req() req: Request) {
    const currentUserId = req['user'].userId;

    const followedUsers =
      await this.followsUsersService.getUsersFollowing(currentUserId);

    return res.status(HttpStatus.OK).json({
      message:
        followedUsers.data.length > 0
          ? 'Followed users fetched successfully'
          : 'No followed users found',
      data: followedUsers,
    });
  }

  @Get('followers')
  @HttpCode(HttpStatus.OK)
  async getFollowersOfUser(@Res() res: Response, @Req() req: Request) {
    const currentUserId = req['user'].userId;
    const followers =
      await this.followsUsersService.getFollowersOfUser(currentUserId);

    return res.status(HttpStatus.OK).json({
      message: 'Followers fetched successfully',
      data: followers,
    });
  }

  @Post('follow/:followingId')
  @HttpCode(HttpStatus.CREATED)
  async followUser(
    @Param('followingId', ParseIntPipe) followingId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const currentUserId = req['user'].userId;

    if (currentUserId === followingId) {
      throw new ForbiddenException('You cannot follow yourself.');
    }

    const follow = await this.followsUsersService.followUser(
      currentUserId,
      followingId,
    );
    return res.status(HttpStatus.CREATED).json({
      message: 'User followed successfully',
      data: follow,
    });
  }

  @Delete('unfollow/:followingId')
  @HttpCode(HttpStatus.OK)
  async unfollowUser(
    @Param('followingId', ParseIntPipe) followingId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const currentUserId = req['user'].userId;
    if (currentUserId === followingId) {
      throw new ForbiddenException('You cannot unfollow yourself.');
    }
    await this.followsUsersService.unfollowUser(currentUserId, followingId);
    return res.status(HttpStatus.OK).json({
      message: 'User unfollowed successfully',
    });
  }
}
