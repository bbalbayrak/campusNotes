import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DEPARTMENT_REPOSITORY } from 'src/config/constants';
import { Department } from './departments.entity';
import { DepartmentDto } from './dto/department.dto';
import { UniversitiesService } from '../universities/universities.service';

@Injectable()
export class DepartmentsService {
  constructor(
    @Inject(DEPARTMENT_REPOSITORY)
    private readonly departmentRepository: typeof Department,
    private readonly uniService: UniversitiesService,
  ) {}

  async getAllDepartments(): Promise<Department[]> {
    const departments = await this.departmentRepository.findAll<Department>();
    return departments;
  }

  async getDepartmentById(id: number): Promise<Department | null> {
    const department = await this.departmentRepository.findByPk(id);
    if (!department || department === null) {
      throw new NotFoundException('department not found');
    }
    return department;
  }

  //ADMIN
  async createDepartment(departmentDto: DepartmentDto): Promise<Department> {
    const isUniExist = await this.uniService.getUniversityById(
      departmentDto.university_id,
    );

    if (!isUniExist) {
      throw new NotFoundException('University not found');
    }

    const newDepartment = await this.departmentRepository.create<Department>({
      ...departmentDto,
    });
    return newDepartment;
  }

  //ADMIN UPDATE FEATURES CAN BE ADDED LATER

  async deleteDepartment(id: number): Promise<void> {
    const deleted = await this.departmentRepository.destroy({
      where: { id: id },
    });
    if (deleted === 0) {
      throw new NotFoundException(`Department with ID ${id} not found.`);
    }
    return;
  }

  async getDepartmentsByUniversityId(
    universityId: number,
  ): Promise<Department[]> {
    const departments = await this.departmentRepository.findAll<Department>({
      where: { university_id: universityId },
    });

    if (!departments || departments.length === 0 || departments === null) {
      throw new NotFoundException(
        'No departments found for the given university ID',
      );
    }

    return departments;
  }
}
