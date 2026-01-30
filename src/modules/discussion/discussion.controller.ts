import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { DiscussionService } from './discussion.service';
import { JwtAuthGuard } from '../auth/passport/jwt.guard';
import { RolesGuard } from 'src/decorators/roles.guard';
import { Roles } from 'src/decorators/roles.decorators';
import { Request } from 'express';
import {
  CreateDiscussionDto,
  DiscussionFiltersDto,
  UpdateDiscussionDto,
} from './dto/discussion.dto';

@Controller('discussions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DiscussionController {
  constructor(private readonly discussionService: DiscussionService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async createDiscussion(
    @Req() req: Request,
    @Body() dto: CreateDiscussionDto,
  ) {
    const userId = req['user'].userId;
    return await this.discussionService.createDiscussion(userId, dto);
  }

  @Get('all')
  async getDiscussions(
    @Req() req: Request,
    @Query('department_id') department_id?: number,
    @Query('lecture_id') lecture_id?: number,
    @Query('search') search?: string,
    @Query('sort') sort?: 'recent' | 'popular' | 'most_commented',
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const userId = req['user']?.userId;

    const filters: DiscussionFiltersDto = {
      department_id: department_id ? Number(department_id) : undefined,
      lecture_id: lecture_id ? Number(lecture_id) : undefined,
      search,
      sort,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    };

    return await this.discussionService.getDiscussions(filters, userId);
  }

  @Get('    ')
  async getTrendingDiscussions(@Query('limit') limit?: number) {
    return await this.discussionService.getTrendingDiscussions(
      limit ? Number(limit) : 10,
    );
  }

  @Get(':id')
  async getDiscussion(@Req() req: Request, @Param('id') id: number) {
    const userId = req['user']?.userId;
    return await this.discussionService.getDiscussionById(Number(id), userId);
  }

  @Put('update/:id')
  @HttpCode(HttpStatus.OK)
  async updateDiscussion(
    @Req() req: Request,
    @Param('id') id: number,
    @Body() dto: UpdateDiscussionDto,
  ) {
    const userId = req['user'].userId;
    return await this.discussionService.updateDiscussion(
      Number(id),
      userId,
      dto,
    );
  }

  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  async deleteDiscussion(@Req() req: Request, @Param('id') id: number) {
    const userId = req['user'].userId;
    const isAdmin = req['user'].role === 'admin';
    return await this.discussionService.deleteDiscussion(
      Number(id),
      userId,
      isAdmin,
    );
  }

  @Post('like/:id')
  @HttpCode(HttpStatus.OK)
  async toggleLike(@Req() req: Request, @Param('id') id: number) {
    const userId = req['user'].userId;
    return await this.discussionService.toggleLike(userId, Number(id));
  }

  // ADMIN ENDPOINTS
  @Roles('admin')
  @Post('pin/:id')
  @HttpCode(HttpStatus.OK)
  async togglePin(@Param('id') id: number) {
    return await this.discussionService.togglePin(Number(id));
  }
}
