import { NOTE_REPOSITORY } from 'src/config/constants';
import { Note } from './notes.entity';

export const NotesProvider = [
  {
    provide: NOTE_REPOSITORY,
    useValue: Note,
  },
];
