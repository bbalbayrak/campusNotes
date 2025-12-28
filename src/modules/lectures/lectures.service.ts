import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { LECTURE_REPOSITORY } from 'src/config/constants';
import { Lecture } from './lectures.entity';
import { LectureDto } from './dto/lecture.dto';

@Injectable()
export class LecturesService {
  constructor(
    @Inject(LECTURE_REPOSITORY)
    private readonly lectureRepository: typeof Lecture,
  ) {}

  //ADMIN
  async createLecture(lectureData: LectureDto): Promise<Lecture> {
    const newLecture =
      await this.lectureRepository.create<Lecture>(lectureData);
    return newLecture;
  }

  async getAllLectures(): Promise<Lecture[]> {
    const lectures = await this.lectureRepository.findAll();
    if (!lectures || lectures.length === 0) {
      throw new NotFoundException('No lectures found');
    }
    return lectures;
  }

  async getLectureById(id: number): Promise<Lecture> {
    const lecture = await this.lectureRepository.findByPk(id);

    if (!lecture) {
      throw new NotFoundException('lecture not found');
    }
    return lecture;
  }

  async getLecturesByDepartment(departmentId: number): Promise<Lecture[]> {
    const lectures = await this.lectureRepository.findAll({
      where: { department_id: departmentId },
    });
    if (!lectures || lectures.length === 0) {
      throw new NotFoundException('No lectures found for this department');
    }
    return lectures;
  }

  async getLecturesByGrade(grade: string): Promise<Lecture[]> {
    const lectures = await this.lectureRepository.findAll({
      where: { grade: grade },
    });
    if (!lectures || lectures.length === 0) {
      throw new NotFoundException('No lectures found for this grade');
    }
    return lectures;
  }

  async getLecturesBySemester(semester: string): Promise<Lecture[]> {
    const lectures = await this.lectureRepository.findAll({
      where: { semester: semester },
    });
    if (!lectures || lectures.length === 0) {
      throw new NotFoundException('No lectures found for this semester');
    }
    return lectures;
  }
}
