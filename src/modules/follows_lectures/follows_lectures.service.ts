import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FOLLOWS_LECTURES_REPOSITORY } from 'src/config/constants';
import { FollowLecture } from './follow_lectures.entity';
import { LecturesService } from '../lectures/lectures.service';

@Injectable()
export class FollowsLecturesService {
  constructor(
    @Inject(FOLLOWS_LECTURES_REPOSITORY)
    private readonly followsLecturesRepository: typeof FollowLecture,
    private readonly lectureService: LecturesService,
  ) {}

  async followLecture(
    userId: number,
    lectureId: number,
  ): Promise<FollowLecture> {
    const existingFollow = await this.followsLecturesRepository.findOne({
      where: { user_id: userId, lecture_id: lectureId },
    });
    const existingLecture = await this.lectureService.getLectureById(lectureId);
    if (!existingLecture) {
      throw new NotFoundException('Lecture does not exist.');
    }

    if (existingFollow) {
      throw new ConflictException('You are already following this lecture.');
    }

    const follow = await this.followsLecturesRepository.create({
      user_id: userId,
      lecture_id: lectureId,
    });
    return follow;
  }

  async unfollowLecture(userId: number, lectureId: number): Promise<void> {
    const existingLecture = await this.lectureService.getLectureById(lectureId);
    if (!existingLecture) {
      throw new NotFoundException('Lecture does not exist.');
    }
    const unfollowCount = await this.followsLecturesRepository.destroy({
      where: { user_id: userId, lecture_id: lectureId },
    });
    if (unfollowCount === 0) {
      throw new ConflictException('You are not following this lecture.');
    }
  }

  async getMyFollowedLectures(userId: number): Promise<FollowLecture[]> {
    const followedLectures = await this.followsLecturesRepository.findAll({
      where: { user_id: userId },
    });

    return followedLectures;
  }
}
