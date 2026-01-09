import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { USER_REPOSITORY } from 'src/config/constants';
import { User } from './users.entity';
import { UserDto } from './dto/user.dto';
import * as bcrypt from 'bcryptjs';
import { SessionService } from '../auth/sessions/sessions.service';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: typeof User,
    private readonly sessionService: SessionService,
  ) {}

  async findUserById(id: number): Promise<User> {
    const user = await this.userRepository.findByPk(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    return user;
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

  async updateUser(
    id: number,
    userData: Partial<UserDto>,
  ): Promise<User | null> {
    const existingUser = await this.userRepository.findOne({
      where: { id: id },
    });
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    const updatedData = { ...userData };
    if (userData.password) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      updatedData.password = hashedPassword;
    }
    await this.userRepository.update(updatedData, {
      where: { id: id },
    });
    return this.userRepository.findByPk(id);
  }

  //ADMIN
  async getAllUsers(): Promise<User[]> {
    const users = await this.userRepository.findAll<User>();

    if (!users || users.length === 0) {
      throw new NotFoundException('No users found');
    }

    return users;
  }

  async verifyUser(id: number): Promise<User> {
    const user = await this.userRepository.findByPk(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    user.verified = true;
    await user.save();
    return user;
  }

  async getUserVerifiedStatus(id: number): Promise<boolean> {
    const user = await this.userRepository.findByPk(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    return user.verified;
  }

  async getUserTrustScore(id: number): Promise<number> {
    const user = await this.userRepository.findByPk(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    return user.trust_score;
  }

  //get users purchases
  //get users notes uploads
  //get users liked notes
  //get users bookmarks

  async deleteUser(id: number): Promise<void> {
    const transaction = await this.userRepository.sequelize.transaction();
    try {
      await this.sessionService.revokeAll(id, { transaction });
      const deletedCount = await this.userRepository.destroy({
        where: { id: id },
        transaction,
      });
      if (deletedCount === 0) {
        throw new NotFoundException(`User with ID ${id} not found.`);
      }
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async incrementTrustScore(
    userId: number,
    incrementBy: number,
  ): Promise<User> {
    const user = await this.userRepository.findByPk(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    user.trust_score += incrementBy;
    await user.save();
    return user;
  }

  async updateUserPendingEarnings(
    userId: number,
    amount: number,
  ): Promise<User> {
    const user = await this.userRepository.findByPk(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }
    const safeAmount = Number(Number(amount).toFixed(2));

    user.pending_earnings = safeAmount;

    try {
      await user.save();
    } catch (error) {
      console.error('DB Save Error:', error);
      throw error;
    }

    return user;
  }
}
