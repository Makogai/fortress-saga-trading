const FAVORITES_KEY_PREFIX = 'fortress-saga-favorites';

function getFavoritesKey(seasonId: string): string {
  return `${FAVORITES_KEY_PREFIX}-${seasonId}`;
}

export function loadFavorites(seasonId: string): string[] {
  try {
    const raw = localStorage.getItem(getFavoritesKey(seasonId));
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    return Array.isArray(arr) && arr.every((x) => typeof x === 'string') ? arr : [];
  } catch {
    return [];
  }
}

export function saveFavorites(seasonId: string, slugs: string[]): void {
  try {
    localStorage.setItem(getFavoritesKey(seasonId), JSON.stringify(slugs));
  } catch {
    // ignore
  }
}
