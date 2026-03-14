const FAVORITES_KEY = 'fortress-saga-favorites';

export function loadFavorites(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    return Array.isArray(arr) && arr.every((x) => typeof x === 'string') ? arr : [];
  } catch {
    return [];
  }
}

export function saveFavorites(slugs: string[]): void {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(slugs));
  } catch {
    // ignore
  }
}
