import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NOTE_REPOSITORY } from 'src/config/constants';
import { Note } from './notes.entity';
import { NoteStatus } from './noteStatus';
import { CreateNoteDto } from './dto/note.dto';
import { UsersService } from '../users/users.service';
import { AwsS3Service } from 'src/config/aws/aws-s3.service';
import { NotesFeedDto } from './dto/notesFeedDto';
import { Redis } from 'ioredis';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
@Injectable()
export class NotesService {
  private readonly redis = new Redis();
  constructor(
    @Inject(NOTE_REPOSITORY) private readonly noteRepository: typeof Note,
    private readonly userService: UsersService,
    private readonly awsS3Service: AwsS3Service,
    @InjectQueue('note-reviews') private noteReviewsQueue: Queue,
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

  async getNoteDetailsById(noteId: number, userId: number): Promise<Note> {
    const note = await this.noteRepository.findByPk(noteId);

    // if (note) {
    //   await note.increment('view_count', { by: 1 });
    // } else {
    //   throw new NotFoundException(`Note with ID ${noteId} not found.`);
    // }

    const redisKey = `view:note:${noteId}:user:${userId}`;
    const hasViewed = await this.redis.get(redisKey);

    if (!hasViewed) {
      await this.redis.set(redisKey, 'true', 'EX', 86400);
      await this.noteReviewsQueue.add('increment-view', { noteId });
    }

    //   const hasAccess =
    //   note.is_free || await this.notePurchaseRepository.findOne({
    //     where: { note_id: noteId, buyer_id: userId, status: 'completed' },
    //   });

    // let signedUrl = null;

    // if (hasAccess) {
    //   signedUrl = await this.awsS3Service.getSignedUrl(
    //     note.file_url,
    //     60 * 10, // 10 dk
    //   );
    // }

    const signedUrl = await this.awsS3Service.getSignedUrl(note.file_url);

    return {
      note: note,
      fileUrl: signedUrl,
    } as any;

    //   return {
    //   id: note.id,
    //   title: note.title,
    //   description: note.description,
    //   previewImageUrl: note.preview_image_url,
    //   signedUrl,
    //   hasAccess,
    // };
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

  async getNotesFeed(query: NotesFeedDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const offset = (page - 1) * limit;

    const where: any = {
      status: NoteStatus.APPROVED,
    };

    if (query.lectureId) {
      where.lecture_id = query.lectureId;
    }

    const { rows, count } = await this.noteRepository.findAndCountAll({
      where,
      attributes: [
        'id',
        'title',
        'preview_image_url',
        'price',
        'is_free',
        'average_rating',
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      meta: {
        page,
        limit,
        total: count,
        hasNextPage: offset + rows.length < count,
      },
      data: rows.map((note) => ({
        id: note.id,
        title: note.title,
        previewImageUrl: note.preview_image_url,
        price: note.price,
        isFree: note.is_free,
        averageRating: note.average_rating,
      })),
    };
  }
}
