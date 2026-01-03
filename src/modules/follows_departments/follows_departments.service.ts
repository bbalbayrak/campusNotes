import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FOLLOWS_DEPARTMENTS_REPOSITORY } from 'src/config/constants';
import { FollowsDepartments } from './follows_departments.entity';
import { DepartmentsService } from '../departments/departments.service';

@Injectable()
export class FollowsDepartmentsService {
  constructor(
    @Inject(FOLLOWS_DEPARTMENTS_REPOSITORY)
    private readonly followsDepartmentsRepository: typeof FollowsDepartments,
    private readonly departmentService: DepartmentsService,
  ) {}

  async followDepartment(
    userId: number,
    departmentId: number,
  ): Promise<FollowsDepartments> {
    const existingFollow = await this.followsDepartmentsRepository.findOne({
      where: { user_id: userId, department_id: departmentId },
    });
    const existingDepartment =
      await this.departmentService.getDepartmentById(departmentId);
    if (existingFollow) {
      throw new ConflictException('You are already following this department.');
    }
    if (!existingDepartment) {
      throw new NotFoundException('Department does not exist.');
    }
    const follow = await this.followsDepartmentsRepository.create({
      user_id: userId,
      department_id: departmentId,
    });
    return follow;
  }

  async unfollowDepartment(
    userId: number,
    departmentId: number,
  ): Promise<void> {
    const existingDepartment =
      await this.departmentService.getDepartmentById(departmentId);
    if (!existingDepartment) {
      throw new NotFoundException('Department does not exist.');
    }
    const unfollowCount = await this.followsDepartmentsRepository.destroy({
      where: { user_id: userId, department_id: departmentId },
    });
    if (unfollowCount === 0) {
      throw new ConflictException('You are not following this department.');
    }
  }

  async getMyFollowedDepartments(
    userId: number,
  ): Promise<FollowsDepartments[]> {
    const followedDepartments = await this.followsDepartmentsRepository.findAll(
      {
        where: { user_id: userId },
      },
    );
    return followedDepartments;
  }
}
