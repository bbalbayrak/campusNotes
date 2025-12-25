import { Module } from '@nestjs/common';
import { AuditLogsService } from './audit_logs.service';
import { AuditLogsController } from './audit_logs.controller';
import { AuditLogsProvider } from './audit_logs.provider';

@Module({
  providers: [AuditLogsService, ...AuditLogsProvider],
  controllers: [AuditLogsController],
})
export class AuditLogsModule {}
