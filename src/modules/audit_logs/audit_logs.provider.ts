import { AUDIT_LOG_REPOSITORY } from 'src/config/constants';
import { AuditLog } from './audit_logs.entity';

export const AuditLogsProvider = [
  {
    provide: AUDIT_LOG_REPOSITORY,
    useValue: AuditLog,
  },
];
