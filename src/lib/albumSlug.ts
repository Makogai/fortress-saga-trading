/**
 * Album/card asset URLs.
 * 1) Bundled from src/assets/albums/<slug>/ (cover.png, 01.png…10.png) when present.
 * 2) Else public/albums/ with your structure: forest-of-order-season/<folder>/cover.png and <card-name>.png
 */

import { CATALOG } from '../data/catalog';

export function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/** Same as titleToSlug, for card names → filename (e.g. "Caligo Pride" → caligo-pride.png). */
export function nameToSlug(name: string): string {
  return titleToSlug(name);
}

/** Your public folder: season folder and numbered album folders. */
const SEASON_PUBLIC = 'forest-of-order-season';
const ALBUMS_PUBLIC = '/albums';

/** Season cover: public/albums/forest-of-order-season/cover.png (in the season folder itself). */
export function getSeasonCoverUrl(): string {
  return `${ALBUMS_PUBLIC}/${SEASON_PUBLIC}/cover.png`;
}

const ALBUM_FOLDER_NAMES = [
  '1 Equipment Album',
  '2 Monster Album',
  '3 Petite Album',
  '4 Boss Album',
  '5 Hero Album I',
  '6 Fortress Album I',
  '7 Hero Album II',
  '8 Fortress Album II',
] as const;

function getCatalogIndexBySlug(slug: string): number {
  return CATALOG.findIndex((a) => titleToSlug(a.title) === slug);
}

/** Vite glob: bundle album covers from src/assets/albums/<slug>/cover.png */
const coverGlob = import.meta.glob<string>(
  '../assets/albums/*/cover.png',
  { eager: true, query: '?url', import: 'default' }
);

/** Vite glob: bundle card images from src/assets/albums/<slug>/01.png … 10.png */
const cardGlob = import.meta.glob<string>(
  '../assets/albums/*/*.png',
  { eager: true, query: '?url', import: 'default' }
);

function getSlugFromGlobPath(path: string): string {
  const parts = path.replace(/^\.\.\//, '').split('/');
  const albumsIdx = parts.indexOf('albums');
  if (albumsIdx >= 0 && parts[albumsIdx + 1]) return parts[albumsIdx + 1];
  return '';
}

const coverMap: Record<string, string> = {};
const cardMap: Record<string, string[]> = {};

for (const [path, url] of Object.entries(coverGlob)) {
  const slug = getSlugFromGlobPath(path);
  if (slug && typeof url === 'string') coverMap[slug] = url;
}

for (const [path, url] of Object.entries(cardGlob)) {
  const parts = path.replace(/^\.\.\//, '').split('/');
  const albumsIdx = parts.indexOf('albums');
  const slug = albumsIdx >= 0 ? parts[albumsIdx + 1] : '';
  const filename = parts[parts.length - 1];
  if (!slug || typeof url !== 'string' || filename === 'cover.png') continue;
  const num = parseInt(filename.slice(0, 2), 10);
  if (Number.isNaN(num) || num < 1 || num > 10) continue;
  if (!cardMap[slug]) cardMap[slug] = [];
  cardMap[slug][num - 1] = url;
}

/** Album cover URL: from bundled src first, else public/albums/forest-of-order-season/<folder>/cover.png */
export function getAlbumCoverUrl(slug: string): string {
  if (coverMap[slug]) return coverMap[slug];
  const idx = getCatalogIndexBySlug(slug);
  if (idx >= 0 && idx < ALBUM_FOLDER_NAMES.length) {
    const folder = encodeURIComponent(ALBUM_FOLDER_NAMES[idx]);
    return `${ALBUMS_PUBLIC}/${SEASON_PUBLIC}/${folder}/cover.png`;
  }
  return `${ALBUMS_PUBLIC}/${slug}/cover.png`;
}

/** Card image URL: from bundled src first, else public by card name (e.g. caligo-pride.png). */
export function getCardImageUrl(slug: string, cardIndex: number): string {
  const list = cardMap[slug];
  if (list?.[cardIndex]) return list[cardIndex];
  const idx = getCatalogIndexBySlug(slug);
  if (idx >= 0 && idx < ALBUM_FOLDER_NAMES.length && CATALOG[idx].cards[cardIndex]) {
    const cardName = CATALOG[idx].cards[cardIndex].name;
    const file = nameToSlug(cardName) + '.png';
    const folder = encodeURIComponent(ALBUM_FOLDER_NAMES[idx]);
    return `${ALBUMS_PUBLIC}/${SEASON_PUBLIC}/${folder}/${file}`;
  }
  const num = String(cardIndex + 1).padStart(2, '0');
  return `${ALBUMS_PUBLIC}/${slug}/${num}.png`;
}
