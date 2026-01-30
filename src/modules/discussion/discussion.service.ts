import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Discussion } from './discussion.entity';
import { DiscussionLike } from './discussion-like.entity';
import { User } from '../users/users.entity';
import { Department } from '../departments/departments.entity';
import { Lecture } from '../lectures/lectures.entity';
import { Op } from 'sequelize';
import {
  CreateDiscussionDto,
  UpdateDiscussionDto,
  DiscussionFiltersDto,
} from './dto/discussion.dto';
import { DiscussionStatus } from './status';
import {
  DISCUSSION_LIKE_REPOSITORY,
  DISCUSSION_REPOSITORY,
} from 'src/config/constants';

@Injectable()
export class DiscussionService {
  constructor(
    @Inject(DISCUSSION_REPOSITORY)
    private readonly discussionRepository: typeof Discussion,
    @Inject(DISCUSSION_LIKE_REPOSITORY)
    private readonly discussionLikeRepository: typeof DiscussionLike,
  ) {}

  async createDiscussion(userId: number, dto: CreateDiscussionDto) {
    const department = await Department.findByPk(dto.department_id);
    if (!department) {
      throw new NotFoundException('Department not found');
    }

    // Create discussion
    const discussion = await this.discussionRepository.create({
      author_id: userId,
      department_id: dto.department_id,
      title: dto.title,
      description: dto.description,
      status: DiscussionStatus.APPROVED,
    });

    return this.getDiscussionById(discussion.id, userId);
  }

  async getDiscussions(filters: DiscussionFiltersDto, userId?: number) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    const where: any = {
      status: DiscussionStatus.APPROVED,
    };

    // Filter by department
    if (filters.department_id) {
      where.department_id = filters.department_id;
    }

    // Filter by lecture
    if (filters.lecture_id) {
      where.lecture_id = filters.lecture_id;
    }

    // Search in title and description
    if (filters.search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${filters.search}%` } },
        { description: { [Op.iLike]: `%${filters.search}%` } },
      ];
    }

    // Sorting
    let order: any = [['createdAt', 'DESC']];
    if (filters.sort === 'popular') {
      order = [['like_count', 'DESC']];
    } else if (filters.sort === 'most_commented') {
      order = [['comment_count', 'DESC']];
    }

    const { rows: discussions, count } =
      await this.discussionRepository.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'name', 'email'],
          },
          {
            model: Department,
            as: 'department',
            attributes: ['id', 'name'],
          },
        ],
        order,
        limit,
        offset,
      });

    let userLikes: number[] = [];
    let userFollows: number[] = [];

    if (userId) {
      const likes = await this.discussionLikeRepository.findAll({
        where: {
          user_id: userId,
          discussion_id: { [Op.in]: discussions.map((d) => d.id) },
        },
        attributes: ['discussion_id'],
      });
      userLikes = likes.map((l) => l.discussion_id);
    }

    const result = discussions.map((d) => ({
      id: d.id,
      title: d.title,
      description: d.description,
      author: d.author,
      department: d.department,
      comment_count: d.comment_count,
      like_count: d.like_count,
      is_pinned: d.is_pinned,
      created_at: d.createdAt,
      updated_at: d.updatedAt,
      is_liked: userLikes.includes(d.id),
      is_followed: userFollows.includes(d.id),
      is_author: userId === d.author_id,
    }));

    return {
      discussions: result,
      pagination: {
        total: count,
        page,
        limit,
        total_pages: Math.ceil(count / limit),
      },
    };
  }

  async getDiscussionById(discussionId: number, userId?: number) {
    const discussion = await this.discussionRepository.findByPk(discussionId, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name'],
        },
      ],
    });

    if (!discussion) {
      throw new NotFoundException('Discussion not found');
    }

    let isLiked = false;
    let isFollowed = false;

    if (userId) {
      const like = await this.discussionLikeRepository.findOne({
        where: { user_id: userId, discussion_id: discussionId },
      });
      isLiked = !!like;
    }

    return {
      id: discussion.id,
      title: discussion.title,
      description: discussion.description,
      author: discussion.author,
      department: discussion.department,
      comment_count: discussion.comment_count,
      like_count: discussion.like_count,
      is_pinned: discussion.is_pinned,
      status: discussion.status,
      created_at: discussion.createdAt,
      updated_at: discussion.updatedAt,
      is_liked: isLiked,
      is_followed: isFollowed,
      is_author: userId === discussion.author_id,
    };
  }

  async updateDiscussion(
    discussionId: number,
    userId: number,
    dto: UpdateDiscussionDto,
  ) {
    const discussion = await this.discussionRepository.findByPk(discussionId);

    if (!discussion) {
      throw new NotFoundException('Discussion not found');
    }

    // Only author can update
    if (discussion.author_id !== userId) {
      throw new BadRequestException('You can only update your own discussions');
    }

    // Update fields
    if (dto.title) discussion.title = dto.title;
    if (dto.description) discussion.description = dto.description;
    await discussion.save();

    return this.getDiscussionById(discussionId, userId);
  }

  async deleteDiscussion(
    discussionId: number,
    userId: number,
    isAdmin: boolean = false,
  ) {
    const discussion = await this.discussionRepository.findByPk(discussionId);

    if (!discussion) {
      throw new NotFoundException('Discussion not found');
    }

    if (discussion.author_id !== userId && !isAdmin) {
      throw new BadRequestException('You can only delete your own discussions');
    }

    await discussion.destroy();

    return {
      success: true,
      message: 'Discussion deleted successfully',
    };
  }

  async toggleLike(userId: number, discussionId: number) {
    const discussion = await this.discussionRepository.findByPk(discussionId);

    if (!discussion) {
      throw new NotFoundException('Discussion not found');
    }

    const existingLike = await this.discussionLikeRepository.findOne({
      where: { user_id: userId, discussion_id: discussionId },
    });

    if (existingLike) {
      // Unlike
      await existingLike.destroy();
      await discussion.decrement('like_count');

      return {
        success: true,
        action: 'unliked',
        like_count: discussion.like_count - 1,
      };
    } else {
      // Like
      await this.discussionLikeRepository.create({
        user_id: userId,
        discussion_id: discussionId,
      });
      await discussion.increment('like_count');

      return {
        success: true,
        action: 'liked',
        like_count: discussion.like_count,
      };
    }
  }

  /**
   * Pin/Unpin discussion (Admin only)
   */
  async togglePin(discussionId: number) {
    const discussion = await this.discussionRepository.findByPk(discussionId);

    if (!discussion) {
      throw new NotFoundException('Discussion not found');
    }

    discussion.is_pinned = !discussion.is_pinned;
    await discussion.save();

    return {
      success: true,
      is_pinned: discussion.is_pinned,
      message: discussion.is_pinned
        ? 'Discussion pinned'
        : 'Discussion unpinned',
    };
  }

  /**
   * Get trending discussions (most activity in last 7 days)
   */
  async getTrendingDiscussions(limit: number = 10) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const discussions = await this.discussionRepository.findAll({
      where: {
        status: 'APPROVED',
        createdAt: { [Op.gte]: sevenDaysAgo },
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name'],
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name'],
        },
      ],
      order: [
        [
          this.discussionRepository.sequelize.literal(
            '(like_count + comment_count * 2)',
          ),
          'DESC',
        ],
      ],
      limit,
    });

    return discussions.map((d) => ({
      id: d.id,
      title: d.title,
      author: d.author,
      department: d.department,
      like_count: d.like_count,
      comment_count: d.comment_count,
      created_at: d.createdAt,
    }));
  }

  async incrementCommentCount(discussionId: number) {
    const discussion = await this.discussionRepository.findByPk(discussionId);
    if (discussion) {
      await discussion.increment('comment_count');
    }
  }

  async decrementCommentCount(discussionId: number) {
    const discussion = await this.discussionRepository.findByPk(discussionId);
    if (discussion && discussion.comment_count > 0) {
      await discussion.decrement('comment_count');
    }
  }
}
