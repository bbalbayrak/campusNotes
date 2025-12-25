import { Test, TestingModule } from '@nestjs/testing';
import { AuthSessionsController } from './auth_sessions.controller';

describe('AuthSessionsController', () => {
  let controller: AuthSessionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthSessionsController],
    }).compile();

    controller = module.get<AuthSessionsController>(AuthSessionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
