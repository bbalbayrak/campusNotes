import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { Note } from 'src/modules/notes/notes.entity';
import { NOTE_REPOSITORY } from '../constants';

@Processor('note-reviews')
export class NoteReview extends WorkerHost {
  constructor(
    @Inject(NOTE_REPOSITORY)
    private readonly noteRepository: typeof Note,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    if (job.name === 'increment-view') {
      const { noteId } = job.data;
      await this.noteRepository.increment('view_count', {
        where: { id: noteId },
        by: 1,
      });
    }

    if (job.name === 'increment-download') {
      const { noteId } = job.data;
      await this.noteRepository.increment('download_count', {
        where: { id: noteId },
        by: 1,
      });
    }

    return {};
  }
}
