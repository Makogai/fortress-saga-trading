import type { CatalogAlbum } from './catalog';
import { CATALOG } from './catalog';

export interface Season {
  id: string;
  name: string;
  catalog: CatalogAlbum[];
}

export const SEASONS: Season[] = [
  { id: 'forest-of-order', name: 'Forest of Order', catalog: CATALOG },
];

const SEASON_IDS = new Set(SEASONS.map((s) => s.id));

export function getCatalog(seasonId: string): CatalogAlbum[] | null {
  const season = SEASONS.find((s) => s.id === seasonId);
  return season ? season.catalog : null;
}

export function getDefaultSeasonId(): string {
  return SEASONS[0]?.id ?? 'forest-of-order';
}

export function isValidSeasonId(seasonId: string): boolean {
  return SEASON_IDS.has(seasonId);
}
