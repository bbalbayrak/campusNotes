import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { LecturesService } from './lectures.service';
import { RolesGuard } from 'src/decorators/roles.guard';
import { JwtAuthGuard } from '../auth/passport/jwt.guard';
import { Roles } from 'src/decorators/roles.decorators';
import { LectureDto } from './dto/lecture.dto';
import { Response } from 'express';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('lectures')
export class LecturesController {
  constructor(private readonly lecturesService: LecturesService) {}

  @Post('create')
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  async createLecture(@Body() lectureDto: LectureDto, @Res() res: Response) {
    const newLecture = await this.lecturesService.createLecture(lectureDto);
    return res.json({
      message: 'Lecture created successfully',
      lecture: newLecture,
    });
  }

  @Get('all')
  @HttpCode(HttpStatus.OK)
  async getAllLectures(@Res() res: Response) {
    const allLectures = await this.lecturesService.getAllLectures();
    return res.json({
      message: 'All lectures retrieved successfully',
      lectures: allLectures,
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getLectureById(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const lecture = await this.lecturesService.getLectureById(id);
    return res.json({
      message: 'Lecture retrieved successfully',
      lecture: lecture,
    });
  }

  @Get('department/:departmentId')
  @HttpCode(HttpStatus.OK)
  async getLecturesByDepartment(
    @Param('departmentId', ParseIntPipe) departmentId: number,
    @Res() res: Response,
  ) {
    const lectures =
      await this.lecturesService.getLecturesByDepartment(departmentId);
    return res.json({
      message: 'Lectures retrieved successfully',
      lectures: lectures,
    });
  }

  @Get('grade/:grade')
  @HttpCode(HttpStatus.OK)
  async getLecturesByGrade(
    @Param('grade') grade: string,
    @Res() res: Response,
  ) {
    const lectures = await this.lecturesService.getLecturesByGrade(grade);
    return res.json({
      message: `Lectures for grade ${grade} retrieved successfully`,
      lectures: lectures,
    });
  }

  @Get('semester/:semester')
  @HttpCode(HttpStatus.OK)
  async getLecturesBySemester(
    @Param('semester') semester: string,
    @Res() res: Response,
  ) {
    const lectures = await this.lecturesService.getLecturesBySemester(semester);
    return res.json({
      message: `Lectures for semester ${semester} retrieved successfully`,
      lectures: lectures,
    });
  }
}
