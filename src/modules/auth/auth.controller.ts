import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { Request, Response } from 'express';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { UserDto } from '../users/dto/user.dto';
import { JwtAuthGuard } from './passport/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() user: UserDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip;

    const newUser = await this.authService.register(user, userAgent, ipAddress);

    return res.status(HttpStatus.CREATED).json({
      message: 'User registered successfully',
      ...newUser,
    });
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Body() authDto: AuthDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip;

    const tokens = await this.authService.login(
      await this.authService.validateUser(authDto.email, authDto.password),
      userAgent,
      ipAddress,
    );
    return res
      .status(HttpStatus.OK)
      .json({ message: 'Login successful', ...tokens });
  }

  @Post('refresh')
  async refresh(
    @Body() body: { userId: number; refreshToken: string },
    @Res() res: Response,
  ) {
    const refreshToken = await this.authService.refreshToken(
      body.userId,
      body.refreshToken,
    );
    return res
      .status(HttpStatus.OK)
      .json({ message: 'Token refreshed successfully', ...refreshToken });
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: any) {
    return this.authService.logout(req.user.id);
  }
}
