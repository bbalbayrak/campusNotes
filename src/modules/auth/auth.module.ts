import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SessionsModule } from './sessions/sessions.module';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LocalStrategy } from './passport/local.strategy';
import { JwtStrategy } from './passport/jwt.strategy';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { JwtExpiredFilter } from './passport/jwtExpire.filter';

@Module({
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    {
      provide: APP_INTERCEPTOR,
      useClass: JwtExpiredFilter,
    },
  ],
  controllers: [AuthController],
  imports: [
    SessionsModule,
    PassportModule,
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: Number(config.get('JWT_EXPIRESIN')),
        },
      }),
    }),
  ],
})
export class AuthModule {}
