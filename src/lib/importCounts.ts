import { CATALOG, catalogToAlbums } from '../data/catalog';
import { resultFromAlbums } from '../parser/parseCards';

const ALBUMS_COUNT = CATALOG.length;
const CARDS_PER_ALBUM = 10;

export interface ImportCountsResult {
  success: true;
  counts: number[];
}

export interface ImportCountsError {
  success: false;
  message: string;
}

/**
 * Parse counts-only import format:
 * - One line per album (same order as catalog).
 * - Each line: 10 comma-separated integers (game order: page 1 then page 2).
 * - Example:
 *   1,1,0,1,1,0,1,1,1,0
 *   1,1,1,2,1,2,2,1,1,1
 *   ...
 */
export function parseCountsOnly(text: string): ImportCountsResult | ImportCountsError {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length !== ALBUMS_COUNT) {
    return {
      success: false,
      message: `Expected ${ALBUMS_COUNT} lines (one per album), got ${lines.length}.`,
    };
  }

  const counts: number[] = [];

  for (let i = 0; i < lines.length; i++) {
    const parts = lines[i].split(',').map((p) => p.trim());
    if (parts.length !== CARDS_PER_ALBUM) {
      return {
        success: false,
        message: `Line ${i + 1} (${CATALOG[i].title}): expected ${CARDS_PER_ALBUM} numbers, got ${parts.length}.`,
      };
    }
    for (let j = 0; j < parts.length; j++) {
      const n = parseInt(parts[j], 10);
      if (Number.isNaN(n) || n < 0) {
        return {
          success: false,
          message: `Line ${i + 1}, position ${j + 1}: invalid number "${parts[j]}".`,
        };
      }
      counts.push(n);
    }
  }

  return { success: true, counts };
}

/** Apply counts array to catalog and return ParseResult. */
export function applyCounts(counts: number[]) {
  const albums = catalogToAlbums(counts);
  return resultFromAlbums(albums);
}
