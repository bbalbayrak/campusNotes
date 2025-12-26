import { Inject, Injectable } from '@nestjs/common';
import { AUTH_SESSION_REPOSITORY } from 'src/config/constants';
import { AuthSession } from './session.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SessionService {
  constructor(
    @Inject(AUTH_SESSION_REPOSITORY)
    private readonly sessionModel: typeof AuthSession,
  ) {}

  async createSession(params: {
    userId: number;
    refreshToken: string;
    userAgent?: string;
    ipAddress?: string;
  }) {
    const tokenHash = await bcrypt.hash(params.refreshToken, 10);

    return this.sessionModel.create({
      user_id: params.userId,
      refresh_token_hash: tokenHash,
      user_agent: params.userAgent,
      ip_address: params.ipAddress,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
  }

  async validateRefreshToken(userId: number, refreshToken: string) {
    const sessions = await this.sessionModel.findAll({
      where: { user_id: userId },
    });

    for (const session of sessions) {
      const match = await bcrypt.compare(
        refreshToken,
        session.refresh_token_hash,
      );

      if (match && session.expires_at > new Date()) {
        return session;
      }
    }
    return null;
  }

  async revokeSession(sessionId: number) {
    return this.sessionModel.destroy({ where: { id: sessionId } });
  }

  async revokeAll(userId: number) {
    return this.sessionModel.destroy({ where: { user_id: userId } });
  }
}
