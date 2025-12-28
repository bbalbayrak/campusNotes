import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { UserDto } from '../users/dto/user.dto';
import { JwtAuthGuard } from './passport/jwt.guard';
import { JwtService } from '@nestjs/jwt';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('register')
  async register(
    @Body() user: UserDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip;

    const newUser = await this.authService.register(user, userAgent, ipAddress);

    res.cookie('refresh_token', newUser.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(HttpStatus.CREATED).json({
      message: 'User registered successfully',
      data: newUser,
    });
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Res() res: Response, @Req() req: Request) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip;

    const tokens = await this.authService.login(
      req['user'],
      userAgent,
      ipAddress,
    );

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res
      .status(HttpStatus.OK)
      .json({ message: 'Login successful', ...tokens });
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('refresh')
  async refresh(
    @Body() body: { userId: number; refreshToken: string },
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const payload = this.jwtService.verify(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET,
    });

    const refreshTokenData = await this.authService.refreshToken(
      payload.sub,
      refreshToken,
    );

    return res
      .status(HttpStatus.OK)
      .json({ message: 'Token refreshed successfully', ...refreshTokenData });
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const user = req['user'];
    res.clearCookie('refresh_token');
    const result = await this.authService.logout(user.userId);

    return res.status(HttpStatus.OK).json({
      message: 'Logged out successfully',
      data: result,
    });
  }
}
