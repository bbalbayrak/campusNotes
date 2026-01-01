import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NOTE_REPOSITORY } from 'src/config/constants';
import { Note } from './notes.entity';
import { NoteStatus } from './noteStatus';
import { CreateNoteDto } from './dto/note.dto';
import { UsersService } from '../users/users.service';
import { AwsS3Service } from 'src/config/aws/aws-s3.service';

@Injectable()
export class NotesService {
  constructor(
    @Inject(NOTE_REPOSITORY) private readonly noteRepository: typeof Note,
    private readonly userService: UsersService,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  async getApprovedNotes(): Promise<Note[]> {
    const notes = await this.noteRepository.findAll({
      where: { status: NoteStatus.APPROVED },
    });
    if (!notes || notes.length === 0) {
      throw new NotFoundException('No approved notes found.');
    }
    return notes;
  }

  async getNoteByLecture(lectureId: number): Promise<Note[]> {
    const notes = await this.noteRepository.findAll({
      where: { lecture_id: lectureId, status: NoteStatus.APPROVED },
    });
    if (!notes || notes.length === 0) {
      throw new NotFoundException('No approved notes found for this lecture.');
    }
    return notes;
  }

  async getNotesByAuthor(authorId: number): Promise<Note[]> {
    const notes = await this.noteRepository.findAll({
      where: { author_id: authorId },
    });
    if (!notes || notes.length === 0) {
      throw new NotFoundException('No notes found for this author.');
    }
    return notes;
  }

  //ADMIN
  async getNotesByStatus(status: NoteStatus): Promise<Note[]> {
    const notes = await this.noteRepository.findAll({
      where: { status },
    });
    if (!notes || notes.length === 0) {
      throw new NotFoundException(`No notes found with status: ${status}.`);
    }
    return notes;
  }

  //ADMIN
  async updateNoteStatus(noteId: number, status: NoteStatus): Promise<Note> {
    const note = await this.noteRepository.findOne({
      where: { id: noteId },
    });

    if (!note) {
      throw new NotFoundException(`Note with ID ${noteId} not found.`);
    }

    const updatedNote = await this.noteRepository.update(
      { status },
      { where: { id: noteId }, returning: true },
    );

    return updatedNote[1][0];
  }

  //ADMIN
  async approveNote(noteId: number): Promise<Note> {
    const note = await this.noteRepository.findOne({
      where: { id: noteId },
    });
    if (!note) {
      throw new NotFoundException(`Note with ID ${noteId} not found.`);
    }
    const data = this.updateNoteStatus(noteId, NoteStatus.APPROVED);
    return data;
  }

  //ADMIN
  async rejectNote(noteId: number): Promise<Note> {
    const note = await this.noteRepository.findOne({
      where: { id: noteId },
    });
    if (!note) {
      throw new NotFoundException(`Note with ID ${noteId} not found.`);
    }
    const data = this.updateNoteStatus(noteId, NoteStatus.REJECTED);
    return data;
  }

  async getPaidOrFreeNotes(isFree: boolean): Promise<Note[]> {
    const notes = await this.noteRepository.findAll({
      where: { is_free: isFree, status: NoteStatus.APPROVED },
    });
    if (!notes || notes.length === 0) {
      throw new NotFoundException(
        `No ${isFree ? 'free' : 'paid'} notes found.`,
      );
    }
    return notes;
  }

  async getNoteDetailsById(noteId: number): Promise<Note> {
    const note = await this.noteRepository.findByPk(noteId);
    if (note) {
      await note.increment('view_count', { by: 1 });
    } else {
      throw new NotFoundException(`Note with ID ${noteId} not found.`);
    }
    const signedUrl = await this.awsS3Service.getSignedUrl(note.file_url);

    return {
      note: note,
      fileUrl: signedUrl,
    } as any;
  }

  async createNote(noteData: Partial<Note>): Promise<Note> {
    const checkAuthor = await this.userService.findUserById(noteData.author_id);
    if (!checkAuthor) {
      throw new NotFoundException(
        `Author with ID ${noteData.author_id} not found.`,
      );
    }

    const newNote = await this.noteRepository.create(noteData);
    return newNote;
  }

  //AUTHOR ONLY
  async updateNote(noteId: number, noteData: CreateNoteDto): Promise<Note> {
    const note = await this.noteRepository.findOne({
      where: { id: noteId },
    });
    if (!note) {
      throw new NotFoundException(`Note with ID ${noteId} not found.`);
    }
    await this.noteRepository.update(noteData, {
      where: { id: noteId },
    });
    const updatedNote = await this.noteRepository.findOne({
      where: { id: noteId },
    });

    return updatedNote;
  }

  //AUTHOR OR ADMIN
  async deleteNote(noteId: number): Promise<{ message: string }> {
    const note = await this.noteRepository.findOne({
      where: { id: noteId },
    });
    if (!note) {
      throw new NotFoundException(`Note with ID ${noteId} not found.`);
    }
    await this.noteRepository.destroy({
      where: { id: noteId },
    });
    return { message: `Note with ID ${noteId} has been deleted.` };
  }

  //note download registration
  async registerDownload(id: number) {
    await this.noteRepository.increment('download_count', {
      where: { id },
      by: 1,
    });
  }

  async getPopularNotes() {
    const popularNotes = await this.noteRepository.findAll({
      order: [
        ['view_count', 'DESC'],
        ['average_rating', 'DESC'],
      ],
      limit: 10,
    });
    if (!popularNotes || popularNotes.length === 0) {
      throw new NotFoundException('No popular notes found.');
    }
    return popularNotes;
  }
}
