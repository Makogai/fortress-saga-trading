const GOALS_KEY_PREFIX = 'fortress-saga-goals';

function getGoalsKey(seasonId: string): string {
  return `${GOALS_KEY_PREFIX}-${seasonId}`;
}

export function loadGoals(seasonId: string): string[] {
  try {
    const raw = localStorage.getItem(getGoalsKey(seasonId));
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    return Array.isArray(arr) && arr.every((x) => typeof x === 'string') ? arr : [];
  } catch {
    return [];
  }
}

export function saveGoals(seasonId: string, albumTitles: string[]): void {
  try {
    localStorage.setItem(getGoalsKey(seasonId), JSON.stringify(albumTitles));
  } catch {
    // ignore
  }
}
