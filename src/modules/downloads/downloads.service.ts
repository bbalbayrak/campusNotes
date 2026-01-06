import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { Downloads } from './downloads.entity';
import { DOWNLOAD_REPOSITORY } from 'src/config/constants';

@Injectable()
export class DownloadsService {
  constructor(
    @Inject(DOWNLOAD_REPOSITORY)
    private readonly downloadsRepository: typeof Downloads,
  ) {}

  async findDownloadRecord(
    userId: number,
    noteId: number,
  ): Promise<Downloads | null> {
    return this.downloadsRepository.findOne({
      where: { user_id: userId, note_id: noteId },
    });
  }

  async createDownloadRecord(
    userId: number,
    noteId: number,
  ): Promise<Downloads> {
    const isDownloaded = await this.findDownloadRecord(userId, noteId);
    if (isDownloaded) {
      throw new ConflictException('Download record already exists.');
    }

    return this.downloadsRepository.create({
      user_id: userId,
      note_id: noteId,
    });
  }

  async getUserDownloadCount(userId: number): Promise<number> {
    const count = await this.downloadsRepository.count({
      where: { user_id: userId },
    });
    return count;
  }

  async getNoteDownloadCount(noteId: number): Promise<number> {
    const count = await this.downloadsRepository.count({
      where: { note_id: noteId },
    });
    return count;
  }

  async getUsersDownloadedNotes(userId: number): Promise<Downloads[]> {
    return this.downloadsRepository.findAll({
      where: { user_id: userId },
    });
  }
}
