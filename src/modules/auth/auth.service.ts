import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/users.entity';
import { SessionService } from './sessions/sessions.service';
import { UserDto } from '../users/dto/user.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly sessionService: SessionService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    } else {
      return null;
    }
  }

  async login(user: User, userAgent?: string, ipAddress?: string) {
    const accessToken = await this.signAccessToken(user);
    const refreshToken = await this.signRefreshToken(user);

    await this.sessionService.createSession({
      userId: user.id,
      refreshToken,
      userAgent,
      ipAddress,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async register(userData: UserDto, userAgent?: string, ipAddress?: string) {
    const user = await this.userService.createUser(userData);

    const accessToken = await this.signAccessToken(user);
    const refreshToken = await this.signRefreshToken(user);
    //check the existing mail
    await this.sessionService.createSession({
      userId: user.id,
      refreshToken,
      userAgent,
      ipAddress,
    });

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async logout(userId: number) {
    await this.sessionService.revokeAll(userId);
    return { message: 'Logged out successfully' };
  }

  async signRefreshToken(user: User) {
    const payload = { sub: user.id };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
    });
  }

  async refreshToken(userId: number, refreshToken: string) {
    const session = await this.sessionService.validateRefreshToken(
      userId,
      refreshToken,
    );

    if (!session) {
      throw new ForbiddenException('Invalid refresh token');
    }

    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }

    const newAccessToken = await this.signAccessToken(user);

    return {
      accessToken: newAccessToken,
    };
  }

  async signAccessToken(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.signAsync(payload);
  }
}
