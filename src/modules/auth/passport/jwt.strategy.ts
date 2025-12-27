import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from './jwt.constants';
import * as dotenv from 'dotenv';
import { UsersService } from 'src/modules/users/users.service';
dotenv.config();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: { userId: number; name: string; role: string }) {
    const user = await this.userService.findUserById(payload.userId);
    if (!user) {
      this.throwUnauthorized();
    }

    return { userId: user.id, email: user.email, role: user.role };
  }
  private throwUnauthorized() {
    throw new UnauthorizedException(
      'Unauthorized: User not found or token invalid.',
    );
  }
}
