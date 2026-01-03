import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FOLLOWS_USERS_REPOSITORY } from 'src/config/constants';
import { FollowsUsers } from './follows_users.entity';

@Injectable()
export class FollowsUsersService {
  constructor(
    @Inject(FOLLOWS_USERS_REPOSITORY)
    private readonly followsUsersRepository: typeof FollowsUsers,
  ) {}

  // Follow a user
  async followUser(
    followerId: number,
    followingId: number,
  ): Promise<FollowsUsers> {
    const existingFollow = await this.isFollowing(followerId, followingId);

    if (existingFollow) {
      throw new ConflictException('You are already following this user.');
    }

    const follow = await this.followsUsersRepository.create({
      follower_id: followerId,
      following_id: followingId,
    });
    return follow;
  }

  // Unfollow a user
  async unfollowUser(followerId: number, followingId: number): Promise<void> {
    const unfollowCount = (await this.isFollowing(followerId, followingId))
      ? await this.followsUsersRepository.destroy({
          where: { follower_id: followerId, following_id: followingId },
        })
      : 0;

    if (unfollowCount === 0) {
      throw new NotFoundException('You are not following this user.');
    }
  }

  // Get users followed by a specific user -- following
  async getUsersFollowing(
    followerId: number,
    page = 1,
    limit = 20,
  ): Promise<{ data: FollowsUsers[]; meta: any }> {
    const offset = (page - 1) * limit;

    const { rows, count } = await this.followsUsersRepository.findAndCountAll({
      where: { follower_id: followerId },
      include: ['following'],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      data: rows,
      meta: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  // Get followers of a specific user -- followers
  async getFollowersOfUser(
    followingId: number,
    page = 1,
    limit = 20,
  ): Promise<{ data: FollowsUsers[]; meta: any }> {
    const offset = (page - 1) * limit;

    const { rows, count } = await this.followsUsersRepository.findAndCountAll({
      where: { following_id: followingId },
      include: ['follower'],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
    if (!rows || rows.length === 0) {
      throw new NotFoundException('No followers found.');
    }
    return {
      data: rows,
      meta: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    const follow = await this.followsUsersRepository.findOne({
      where: { follower_id: followerId, following_id: followingId },
    });
    return !!follow;
  }
}
