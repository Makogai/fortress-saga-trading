import type { StoredData } from './storage';
import type { Album, ParsedCard } from '../parser/parseCards';
import { loadGoals } from './goalsStorage';
import { loadFavorites } from './favoritesStorage';

export const BACKUP_VERSION = 2;

export interface BackupData {
  version: number;
  exportedAt: string;
  seasonId?: string;
  albums: StoredData['albums'];
  goals: string[];
  favorites: string[];
}

export function buildBackup(albums: StoredData['albums'], seasonId: string): BackupData {
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    seasonId,
    albums,
    goals: loadGoals(seasonId),
    favorites: loadFavorites(seasonId),
  };
}

export function downloadBackup(backup: BackupData): void {
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fortress-saga-backup-${backup.exportedAt.slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Normalize a card from backup (ensure count is number, status derived). */
function normalizeCard(c: unknown): ParsedCard | null {
  if (!c || typeof c !== 'object') return null;
  const o = c as Record<string, unknown>;
  const name = typeof o.name === 'string' ? o.name : '';
  const rarity = typeof o.rarity === 'string' && /^[UREL]$/i.test(o.rarity) ? (o.rarity.toUpperCase() as ParsedCard['rarity']) : 'U';
  let count = typeof o.count === 'number' && Number.isInteger(o.count) && o.count >= 0 ? o.count : 0;
  if (typeof o.count === 'string') {
    const n = parseInt(o.count, 10);
    if (!Number.isNaN(n) && n >= 0) count = n;
  }
  const status = count === 0 ? 'missing' : count === 1 ? 'owned' : 'duplicate';
  return { name, rarity, count, status };
}

/** Normalize an album from backup. */
function normalizeAlbum(a: unknown): Album | null {
  if (!a || typeof a !== 'object') return null;
  const o = a as Record<string, unknown>;
  const title = typeof o.title === 'string' ? o.title : 'Unknown';
  const rawCards = Array.isArray(o.cards) ? o.cards : [];
  const cards: ParsedCard[] = [];
  for (const c of rawCards) {
    const card = normalizeCard(c);
    if (card) cards.push(card);
  }
  return { title, cards };
}

export function parseBackupFile(json: string): { success: true; data: BackupData } | { success: false; message: string } {
  try {
    const data = JSON.parse(json) as unknown;
    if (!data || typeof data !== 'object' || !('albums' in data)) {
      return { success: false, message: 'Invalid backup: missing albums' };
    }
    const b = data as { version?: number; exportedAt?: string; seasonId?: string; albums: unknown; goals?: unknown; favorites?: unknown };
    if (!Array.isArray(b.albums) || b.albums.length === 0) {
      return { success: false, message: 'Invalid backup: no albums' };
    }
    const albums: Album[] = [];
    for (const a of b.albums) {
      const album = normalizeAlbum(a);
      if (album) albums.push(album);
    }
    if (albums.length === 0) {
      return { success: false, message: 'Invalid backup: no valid albums' };
    }
    return {
      success: true,
      data: {
        version: typeof b.version === 'number' ? b.version : BACKUP_VERSION,
        exportedAt: typeof b.exportedAt === 'string' ? b.exportedAt : new Date().toISOString(),
        seasonId: typeof b.seasonId === 'string' ? b.seasonId : undefined,
        albums,
        goals: Array.isArray(b.goals) && b.goals.every((g) => typeof g === 'string') ? b.goals : [],
        favorites: Array.isArray(b.favorites) && b.favorites.every((f) => typeof f === 'string') ? b.favorites : [],
      },
    };
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : 'Failed to parse backup file',
    };
  }
}
