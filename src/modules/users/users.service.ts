import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from 'src/config/constants';
import { User } from './users.entity';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userModel: typeof User,
  ) {}

  async findUserById(id: number): Promise<User> {
    return this.userModel.findByPk(id);
  }
}
