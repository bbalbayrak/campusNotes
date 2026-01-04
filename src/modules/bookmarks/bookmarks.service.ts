import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NoteBookmark } from './bookmarks.entity';
import { BOOKMARK_REPOSITORY, NOTE_REPOSITORY } from 'src/config/constants';
import { NotesService } from '../notes/notes.service';
import { Note } from '../notes/notes.entity';

@Injectable()
export class BookmarksService {
  constructor(
    @Inject(BOOKMARK_REPOSITORY)
    private readonly bookmarkRepository: typeof NoteBookmark,
    @Inject(NOTE_REPOSITORY) private readonly noteRepository: typeof Note,
  ) {}

  async toggleBookmark(userId: number, noteId: number) {
    const existing = await this.bookmarkRepository.findOne({
      where: { user_id: userId, note_id: noteId },
    });

    if (existing) {
      await existing.destroy();
      return { bookmarked: false };
    }

    await this.bookmarkRepository.create({
      user_id: userId,
      note_id: noteId,
    });

    return { bookmarked: true };
  }

  async getUserBookmarks(userId: number) {
    const bookmarks = await this.bookmarkRepository.findAll({
      where: { user_id: userId },
    });

    if (!bookmarks || bookmarks.length === 0) {
      throw new NotFoundException('No bookmarks found for this user.');
    }

    const notes = await this.noteRepository.findAll({
      where: { id: bookmarks.map((b) => b.note_id) },
    });

    return notes;
  }

  async isBookmarked(userId: number, noteId: number): Promise<boolean> {
    const count = await this.bookmarkRepository.count({
      where: { user_id: userId, note_id: noteId },
    });

    return count > 0;
  }
}
