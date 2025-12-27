import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/modules/users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: number; email: string; role: string }) {
    const user = await this.userService.findUserById(payload.sub);
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
