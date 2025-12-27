import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from 'src/config/constants';
import { User } from './users.entity';
import { UserDto } from './dto/user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: typeof User,
  ) {}

  async findUserById(id: number): Promise<User> {
    return this.userRepository.findByPk(id);
  }

  async findByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({ where: { email } });
  }

  async createUser(userData: UserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const hashedUser = {
      ...userData,
      password: hashedPassword,
    };

    return await this.userRepository.create<User>(hashedUser);
  }
}
