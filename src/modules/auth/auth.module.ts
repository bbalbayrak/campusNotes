import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SessionsModule } from './sessions/sessions.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  providers: [AuthService],
  controllers: [AuthController],
  imports: [SessionsModule, PassportModule],
})
export class AuthModule {}
