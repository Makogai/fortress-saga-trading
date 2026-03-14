import type { CatalogAlbum } from '../data/catalog';
import { catalogToAlbums, catalogSlotCount } from '../data/catalog';
import { resultFromAlbums } from '../parser/parseCards';
import type { ParseResult } from '../parser/parseCards';

const HASH_PREFIX = 's=';

/** Encode counts (0–9 and maybe 10+) into a short string. We use base64url of JSON array. */
export function encodeState(data: ParseResult): string {
  const counts: number[] = [];
  for (const album of data.albums) {
    for (const card of album.cards) {
      counts.push(card.count);
    }
  }
  const json = JSON.stringify(counts);
  const base64 = btoa(unescape(encodeURIComponent(json)));
  const base64url = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return base64url;
}

/** Decode payload string (e.g. "#s=base64" or "s=base64") into counts array, or null if invalid. */
export function decodeState(hashOrPayload: string, catalog: CatalogAlbum[]): number[] | null {
  const raw = hashOrPayload.startsWith('#') ? hashOrPayload.slice(1) : hashOrPayload;
  if (!raw.startsWith(HASH_PREFIX)) return null;
  const base64url = raw.slice(HASH_PREFIX.length).trim();
  if (!base64url) return null;
  try {
    let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    if (pad) base64 += '='.repeat(4 - pad);
    const json = decodeURIComponent(escape(atob(base64)));
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return null;
    const expected = catalogSlotCount(catalog);
    const counts = parsed as number[];
    const clamped = counts
      .slice(0, expected)
      .map((n) => Math.max(0, Math.min(99, Number(n) || 0)));
    while (clamped.length < expected) clamped.push(0);
    return clamped;
  } catch {
    return null;
  }
}

/** Get share payload from current page URL: query ?s= first (works when hash is stripped), then hash #s=. */
export function getSharePayloadFromUrl(): string {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams(window.location.search);
  const fromSearch = params.get('s');
  if (fromSearch && fromSearch.trim()) return HASH_PREFIX + fromSearch.trim();
  const hash = window.location.hash.slice(1);
  if (hash.startsWith(HASH_PREFIX)) return hash;
  return '';
}

/** Extract payload from full URL string (for pasted links). Supports ?s= and #s=. */
export function getSharePayloadFromPastedUrl(url: string): string {
  const trimmed = url.trim();
  try {
    const base = typeof window !== 'undefined' ? window.location.origin : 'https://x';
    const u = trimmed.startsWith('http') ? new URL(trimmed) : new URL(trimmed, base);
    const fromSearch = u.searchParams.get('s');
    if (fromSearch && fromSearch.trim()) return HASH_PREFIX + fromSearch.trim();
    const hash = u.hash.slice(1);
    if (hash.startsWith(HASH_PREFIX)) return hash;
  } catch {
    const hashIndex = trimmed.indexOf('#');
    const part = hashIndex >= 0 ? trimmed.slice(hashIndex + 1) : trimmed;
    if (part.startsWith(HASH_PREFIX)) return part;
  }
  return '';
}

/** Decode pasted URL or payload string into counts. Use for Import from link. */
export function decodeStateFromUrl(urlOrHash: string, catalog: CatalogAlbum[]): number[] | null {
  const payload = getSharePayloadFromPastedUrl(urlOrHash);
  return payload ? decodeState(payload, catalog) : null;
}

/** Build full share URL. Uses ?s= so links work when hash is stripped (e.g. in-app browsers). */
export function buildShareUrl(data: ParseResult): string {
  const payload = encodeState(data);
  const base = typeof window !== 'undefined'
    ? window.location.origin + window.location.pathname
    : '';
  return `${base}?s=${payload}`;
}

/** From counts array (e.g. from decodeState), produce ParseResult. */
export function stateToResult(counts: number[], catalog: CatalogAlbum[]): ParseResult {
  const albums = catalogToAlbums(counts, catalog);
  return resultFromAlbums(albums);
}
