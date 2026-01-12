import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  CourseInput,
  GeneralGradingInput,
  GradingService,
} from './uni-grading-system.service';
import { JwtAuthGuard } from '../auth/passport/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('grading')
export class GradingController {
  constructor(private readonly gradingService: GradingService) {}

  @Post('quick-gpa')
  async getQuickGPA(@Body('courses') courses: CourseInput[]) {
    return { gpa: this.gradingService.calculateQuickGPA(courses) };
  }

  @Post('target-wizard')
  async getTargets(@Body() input: GeneralGradingInput) {
    return this.gradingService.calculateFinalTargets(input);
  }
}
