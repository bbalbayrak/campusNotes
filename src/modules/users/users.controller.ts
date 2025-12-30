import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/passport/jwt.guard';
import { Request, Response } from 'express';
import { RolesGuard } from 'src/decorators/roles.guard';
import { Roles } from 'src/decorators/roles.decorators';
import { UserDto } from './dto/user.dto';
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getProfile(@Req() req: Request, @Res() res: Response) {
    const userId = req['user'].userId;
    const user = await this.userService.findUserById(userId);
    return res.json({
      message: 'User profile retrieved successfully',
      data: user,
    });
  }

  //ADMIN
  @Get('all')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async getAllUsers(@Res() res: Response) {
    const users = await this.userService.getAllUsers();
    return res.json({
      message: 'All users retrieved successfully',
      data: users,
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getUserById(
    @Param('id', ParseIntPipe) userId: number,
    @Res() res: Response,
  ) {
    const user = await this.userService.findUserById(userId);
    return res.json({
      message: 'User retrieved successfully',
      data: user,
    });
  }

  @Put('update')
  @HttpCode(HttpStatus.CREATED)
  async updateUser(
    @Body() UserDto: UserDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const userId = req['user'].userId;
    const updatedUser = await this.userService.updateUser(userId, UserDto);
    return res.json({
      message: 'User updated successfully',
      data: updatedUser,
    });
  }

  //ADMIN
  @Put('verify/:id')
  @HttpCode(HttpStatus.OK)
  async verifyUser(
    @Param('id', ParseIntPipe) userId: number,
    @Res() res: Response,
  ) {
    const verifiedUser = await this.userService.verifyUser(userId);
    return res.json({
      message: 'User verification status retrieved successfully',
      data: verifiedUser,
    });
  }

  @Get('verifyStatus/:id')
  @HttpCode(HttpStatus.OK)
  async getVerificationStatus(
    @Param('id', ParseIntPipe) userId: number,
    @Res() res: Response,
  ) {
    const userVerifiedStatus =
      await this.userService.getUserVerifiedStatus(userId);
    return res.json({
      message: 'User verification status retrieved successfully',
      verified: userVerifiedStatus,
    });
  }

  @Get('trustScore/:id')
  @HttpCode(HttpStatus.OK)
  async getUserTrustScore(
    @Param('id', ParseIntPipe) userId: number,
    @Res() res: Response,
  ) {
    const trustScore = await this.userService.getUserTrustScore(userId);
    return res.json({
      message: 'User trust score retrieved successfully',
      trustScore: trustScore,
    });
  }

  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  async deleteUser(
    @Param('id', ParseIntPipe) userId: number,
    @Res() res: Response,
  ) {
    await this.userService.deleteUser(userId);
    return res.json({
      message: 'User deleted successfully',
    });
  }
}
