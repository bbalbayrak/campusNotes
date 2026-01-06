import { Inject, Injectable } from '@nestjs/common';
import { Op } from 'sequelize';
import { DOWNLOAD_PERMISSION_REPOSITORY } from 'src/config/constants';
import { DownloadPermission } from './permission.entity';

@Injectable()
export class DownloadPermissionsService {
  constructor(
    @Inject(DOWNLOAD_PERMISSION_REPOSITORY)
    private readonly downloadPermissionRepository: typeof DownloadPermission,
  ) {}

  async hasDownloadAccess(userId: number, noteId: number): Promise<boolean> {
    const permission = await this.downloadPermissionRepository.findOne({
      where: {
        userId,
        noteId,
        [Op.or]: [{ expiresAt: null }, { expiresAt: { [Op.gt]: new Date() } }],
      },
    });

    return !!permission;
  }
}
