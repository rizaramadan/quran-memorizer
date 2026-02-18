import quranPages from '@/assets/quran-data/quran-pages.json';

export interface MushafWord {
  location: string;
  word: string;
  qpcV2?: string;
  qpcV1?: string;
}

export interface MushafLine {
  line: number;
  type: 'surah-header' | 'basmala' | 'text';
  text?: string;
  surah?: string;
  verseRange?: string;
  words?: MushafWord[];
  qpcV2?: string;
  qpcV1?: string;
}

export interface MushafPage {
  page: number;
  lines: MushafLine[];
}

const pages = quranPages as MushafPage[];

export function getPage(pageNumber: number): MushafPage {
  if (pageNumber < 1 || pageNumber > 604) {
    throw new RangeError(
      `Page number must be between 1 and 604, got ${pageNumber}`
    );
  }
  return pages[pageNumber - 1];
}

export const TOTAL_PAGES = 604;
