import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/passport/jwt.guard';
import { LocalAuthGuard } from '../auth/passport/local-auth.guard';
import { NotesService } from './notes.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/config/aws/multer-options';
import { AwsS3Service } from 'src/config/aws/aws-s3.service';
import { NoteFileType } from './noteFile.type';
import { CreateNoteDto } from './dto/note.dto';
import { Response } from 'express';
import { Roles } from 'src/decorators/roles.decorators';
import { RolesGuard } from 'src/decorators/roles.guard';
import { NoteStatus } from './noteStatus';
import { PreviewService } from '../preview/preview.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notes')
export class NotesController {
  constructor(
    private readonly notesService: NotesService,
    private readonly awsS3Service: AwsS3Service,
    private readonly previewService: PreviewService,
  ) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async createNote(
    @Body() createNoteDto: CreateNoteDto,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const fileKey = await this.awsS3Service.uploadFile(file);

    const previewBuffer = await this.previewService.generatePreview(
      file.buffer,
      fileKey.split('/').pop(),
    );

    const previewUrl = await this.awsS3Service.uploadPreview(
      previewBuffer,
      fileKey.split('/').pop(),
    );

    const fileType =
      file.mimetype === 'application/pdf'
        ? NoteFileType.PDF
        : (file.mimetype.split('/')[1] as NoteFileType);

    const newNote = await this.notesService.createNote({
      author_id: createNoteDto.authorId,
      lecture_id: createNoteDto.lectureId,
      title: createNoteDto.title,
      description: createNoteDto.description,
      price: createNoteDto.price ?? 0,
      is_free: createNoteDto.isFree,
      file_url: fileKey,
      file_type: fileType,
      preview_image_url: previewUrl,
    });

    return res.json({ message: 'Note created successfully', note: newNote });
  }

  @HttpCode(HttpStatus.OK)
  @Get('detail/:id')
  async getNoteById(@Param('id') id: number, @Res() res: Response) {
    const note = await this.notesService.getNoteDetailsById(id);

    if (!note) {
      throw new NotFoundException('Note not found');
    }
    return res.json({ message: 'Note fetched successfully', note: note });
  }

  @Get('approved')
  @HttpCode(HttpStatus.OK)
  async getApprovedNotes(@Res() res: Response) {
    const notes = await this.notesService.getApprovedNotes();
    return res.json({
      message: 'Approved notes fetched successfully',
      notes: notes,
    });
  }

  @Get('lecture/:lectureId')
  @HttpCode(HttpStatus.OK)
  async getNotesByLecture(
    @Param('lectureId', ParseIntPipe) lectureId: number,
    @Res() res: Response,
  ) {
    const notes = await this.notesService.getNoteByLecture(lectureId);
    return res.json({ message: 'Notes fetched successfully', notes: notes });
  }

  @Get('author/:authorId')
  @HttpCode(HttpStatus.OK)
  async getNotesByAuthor(
    @Param('authorId', ParseIntPipe) authorId: number,
    @Res() res: Response,
  ) {
    const notes = await this.notesService.getNotesByAuthor(authorId);
    return res.json({ message: 'Notes fetched successfully', notes: notes });
  }

  @Get('paid-or-free')
  @HttpCode(HttpStatus.OK)
  async getNoteAsPaidOrFree(
    @Query('isFree') isFree: boolean,
    @Res() res: Response,
  ) {
    const updatedNote = await this.notesService.getPaidOrFreeNotes(isFree);
    return res.json({
      message: 'Note marked as paid/free successfully',
      note: updatedNote,
    });
  }

  @Get('popularNotes')
  @HttpCode(HttpStatus.OK)
  async getPopularNotes(@Res() res: Response) {
    const notes = await this.notesService.getPopularNotes();
    return res.json({
      message: 'Popular notes fetched successfully',
      notes: notes,
    });
  }

  //----------ADMIN----------
  @Get('status/:status')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  async getNotesByStatus(
    @Param('status') status: string,
    @Res() res: Response,
  ) {
    const notes = await this.notesService.getNotesByStatus(status as any);
    return res.json({ message: 'Notes fetched successfully', notes: notes });
  }

  @Put('status/approve/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  async approveNote(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const updatedNote = await this.notesService.approveNote(id);
    return res.json({
      message: 'Note approved successfully',
      note: updatedNote,
    });
  }

  @Put('status/reject/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  async rejectNote(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const updatedNote = await this.notesService.rejectNote(id);
    return res.json({
      message: 'Note rejected successfully',
      note: updatedNote,
    });
  }

  //   @Get(':id/download')
  //   async downloadNote(@Param('id') id: number) {
  //     const note = await this.notesService.findById(id);

  //     if (!note) {
  //       throw new NotFoundException('Note not found');
  //     }

  //     const signedUrl = await this.awsS3Service.getSignedUrl(note.fileUrl);

  //     return {
  //       url: signedUrl,
  //       expiresIn: '5 minutes',
  //     };
  //   }
}
