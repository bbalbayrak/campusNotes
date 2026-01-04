import { BOOKMARK_REPOSITORY } from 'src/config/constants';
import { NoteBookmark } from './bookmarks.entity';

export const BookmarksProvider = [
  {
    provide: BOOKMARK_REPOSITORY,
    useValue: NoteBookmark,
  },
];
