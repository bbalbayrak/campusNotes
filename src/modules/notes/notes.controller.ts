import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/passport/jwt.guard';
import { LocalAuthGuard } from '../auth/passport/local-auth.guard';
import { NotesService } from './notes.service';
import { FilesInterceptor } from '@nestjs/platform-express';

@UseGuards(JwtAuthGuard, LocalAuthGuard)
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async createNote() {}
}
