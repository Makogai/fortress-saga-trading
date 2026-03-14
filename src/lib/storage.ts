import type { Album } from '../parser/parseCards';

const STORAGE_KEY_PREFIX = 'fortress-saga-data';

export interface StoredData {
  albums: Album[];
}

export function getStorageKey(seasonId: string): string {
  return `${STORAGE_KEY_PREFIX}-${seasonId}`;
}

export function loadFromStorage(seasonId: string): StoredData | null {
  try {
    const raw = localStorage.getItem(getStorageKey(seasonId));
    if (!raw) return null;
    const data = JSON.parse(raw) as StoredData;
    if (!data?.albums?.length) return null;
    return data;
  } catch {
    return null;
  }
}

export function saveToStorage(seasonId: string, data: StoredData): void {
  try {
    localStorage.setItem(getStorageKey(seasonId), JSON.stringify(data));
  } catch {
    // ignore
  }
}

const CURRENT_SEASON_KEY = 'fortress-saga-season';

export function loadCurrentSeasonId(): string | null {
  try {
    return localStorage.getItem(CURRENT_SEASON_KEY);
  } catch {
    return null;
  }
}

export function saveCurrentSeasonId(seasonId: string): void {
  try {
    localStorage.setItem(CURRENT_SEASON_KEY, seasonId);
  } catch {
    // ignore
  }
}
