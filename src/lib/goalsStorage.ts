const GOALS_KEY = 'fortress-saga-goals';

export function loadGoals(): string[] {
  try {
    const raw = localStorage.getItem(GOALS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    return Array.isArray(arr) && arr.every((x) => typeof x === 'string') ? arr : [];
  } catch {
    return [];
  }
}

export function saveGoals(albumTitles: string[]): void {
  try {
    localStorage.setItem(GOALS_KEY, JSON.stringify(albumTitles));
  } catch {
    // ignore
  }
}
