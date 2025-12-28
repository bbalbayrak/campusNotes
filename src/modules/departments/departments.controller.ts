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
import { DepartmentsService } from './departments.service';
import { JwtAuthGuard } from '../auth/passport/jwt.guard';
import { RolesGuard } from 'src/decorators/roles.guard';
import { DepartmentDto } from './dto/department.dto';
import { Response } from 'express';
import { Roles } from 'src/decorators/roles.decorators';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('department')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Roles('admin')
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async createDepartment(
    @Body() departmentDto: DepartmentDto,
    @Res() res: Response,
  ) {
    const newDepartment =
      await this.departmentsService.createDepartment(departmentDto);
    return res.json({
      message: 'Department created successfully',
      department: newDepartment,
    });
  }

  @Get('all')
  @HttpCode(HttpStatus.OK)
  async getAllDepartments(@Res() res: Response) {
    const allDepartments = await this.departmentsService.getAllDepartments();
    return res.json({
      message: 'All departments retrieved successfully',
      departments: allDepartments,
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getDepartmentById(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const department = await this.departmentsService.getDepartmentById(id);
    return res.json({
      message: `Department with ID ${id} retrieved successfully`,
      department: department,
    });
  }

  @Delete('delete/:id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDepartment(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    await this.departmentsService.deleteDepartment(id);
    return res.status(HttpStatus.NO_CONTENT).send();
  }
}
