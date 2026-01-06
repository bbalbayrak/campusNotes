import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { RedisService } from 'src/config/redis/redis.service';
import { BookmarksService } from '../bookmarks/bookmarks.service';
import { DownloadsService } from '../downloads/downloads.service';
@Injectable()
export class NotesService {
  private readonly redis = new Redis();
  constructor(
    @Inject(NOTE_REPOSITORY) private readonly noteRepository: typeof Note,
    private readonly userService: UsersService,
    private readonly awsS3Service: AwsS3Service,
    @InjectQueue('note-reviews') private noteReviewsQueue: Queue,
    private readonly redisService: RedisService,
    private readonly bookmarksService: BookmarksService,
    private readonly downloadsService: DownloadsService,
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
    await this.invalidateFeedCache();
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
    await this.invalidateFeedCache();
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

    const redisKey = `view:note:${noteId}:user:${userId}`;
    const hasViewed = await this.redis.get(redisKey);

    if (!hasViewed) {
      await this.redis.set(redisKey, 'true', 'EX', 86400);
      await this.noteReviewsQueue.add('increment-view', { noteId });
    }

    //for now free access to all notes
    const hasAccess = note.is_free;

    //   const hasAccess =
    //   note.is_free || await this.notePurchaseRepository.findOne({
    //     where: { note_id: noteId, buyer_id: userId, status: 'completed' },
    //   });

    let signedUrl: string | null = null;

    // if (hasAccess) {
    //   signedUrl = await this.awsS3Service.getSignedUrl(
    //     note.file_url,
    //     60 * 10, // 10 dk
    //   );
    // }

    if (hasAccess) {
      const signedCacheKey = `signed:note:${noteId}:user:${userId}`;
      const cachedSignedUrl = await this.redis.get(signedCacheKey);

      if (cachedSignedUrl) {
        signedUrl = cachedSignedUrl;
      } else {
        signedUrl = await this.awsS3Service.getSignedUrl(
          note.file_url,
          60 * 30,
        );

        await this.redis.set(signedCacheKey, signedUrl, 'EX', 60 * 20);
      }
    }
    const isBookmarked = await this.bookmarksService.isBookmarked(
      userId,
      noteId,
    );

    const response = {
      id: note.id,
      lecture_id: note.lecture_id,
      author_id: note.author_id,
      title: note.title,
      description: note.description,
      file_url: note.file_url,
      file_type: note.file_type,
      price: note.price,
      view_count: note.view_count,
      download_count: note.download_count,
      average_rating: note.average_rating,
      is_free: note.is_free,
      status: note.status,
      preview_image_url: note.preview_image_url,
      hasAccess,
      isBookmarked,
      signedUrl,
    };

    //const signedUrl = await this.awsS3Service.getSignedUrl(note.file_url);

    return response as any;

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
    if (newNote.status === NoteStatus.APPROVED) {
      await this.invalidateFeedCache();
    }
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

    await this.invalidateFeedCache();

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
    await this.invalidateFeedCache();
    return { message: `Note with ID ${noteId} has been deleted.` };
  }

  //note download registration
  async registerDownload(noteId: number, userId: number) {
    const note = await this.noteRepository.findByPk(noteId);

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    const hasAccess = note.is_free === true;

    if (!hasAccess) {
      throw new ForbiddenException('You have no access to this note');
    }

    const redisKey = `download:note:${noteId}:user:${userId}`;
    const alreadyDownloaded = await this.redis.get(redisKey);

    if (!alreadyDownloaded) {
      await this.redis.set(redisKey, 'true', 'EX', 86400);
      await this.noteReviewsQueue.add('increment-download', { noteId });
    }
    const signedUrlKey = `signedurl:note:${noteId}:user:${userId}`;
    let signedUrl = await this.redis.get(signedUrlKey);

    if (!signedUrl) {
      signedUrl = await this.awsS3Service.getSignedUrl(note.file_url, 300);

      await this.redis.set(signedUrlKey, signedUrl, 'EX', 240);
    }

    const downloadedNote = await this.downloadsService.createDownloadRecord(
      userId,
      noteId,
    );

    return {
      downloadUrl: signedUrl,
      expiresIn: 300,
      downloadedNote,
    };
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

    const lectureKey = query.lectureId ?? 'all';
    const cacheKey = `notes:feed:page:${page}:limit:${limit}:lecture:${lectureKey}`;

    const cached = await this.redisService.client.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

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

    const response = {
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

    await this.redisService.client.set(
      cacheKey,
      JSON.stringify(response),
      'EX',
      60,
    );
    return response;
  }

  async invalidateFeedCache() {
    const keys = await this.redisService.client.keys('notes:feed:*');
    if (keys.length) {
      await this.redisService.client.del(keys);
    }
  }
}
