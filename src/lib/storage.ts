import type { Album } from '../parser/parseCards';

const STORAGE_KEY = 'fortress-saga-data';

export interface StoredData {
  albums: Album[];
}

export function loadFromStorage(): StoredData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as StoredData;
    if (!data?.albums?.length) return null;
    return data;
  } catch {
    return null;
  }
}

export function saveToStorage(data: StoredData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}
