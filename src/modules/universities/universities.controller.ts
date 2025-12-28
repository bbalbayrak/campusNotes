import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UniversitiesService } from './universities.service';
import { Roles } from 'src/decorators/roles.decorators';
import { UniDto } from './dto/uni.dto';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/passport/jwt.guard';
import { RolesGuard } from 'src/decorators/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('universities')
export class UniversitiesController {
  constructor(private readonly universitiesService: UniversitiesService) {}

  @Roles('admin')
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async createUniversity(@Body() uniDto: UniDto, @Res() res: Response) {
    const newUni = await this.universitiesService.createUniversity(uniDto);

    return res.json({
      message: 'University created successfully',
      university: newUni,
    });
  }

  @Get('all')
  @HttpCode(HttpStatus.OK)
  async getAllUniversities(@Res() res: Response) {
    const allUnis = await this.universitiesService.getAllUniversities();
    return res.json({
      message: 'All universities retrieved successfully',
      universities: allUnis,
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getUniversityById(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const uni = await this.universitiesService.getUniversityById(id);
    return res.json({
      message: `University with ID ${id} retrieved successfully`,
      university: uni,
    });
  }
  @Roles('admin')
  @Post('update/:id')
  @HttpCode(HttpStatus.CREATED)
  async updateUniversity(
    @Param('id', ParseIntPipe) id: number,
    @Body() uniDto: UniDto,
    @Res() res: Response,
  ) {
    const updatedUni = await this.universitiesService.updateUniversity(
      id,
      uniDto,
    );
    return res.json({
      message: `University with ID ${id} updated successfully`,
      university: updatedUni,
    });
  }

  @Roles('admin')
  @Delete('delete/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUniversity(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    await this.universitiesService.deleteUniversity(id);
    return res.status(HttpStatus.NO_CONTENT).send();
  }
}
