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

/** Decode hash fragment into counts array, or null if invalid. */
export function decodeState(hash: string): number[] | null {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!raw.startsWith(HASH_PREFIX)) return null;
  const base64url = raw.slice(HASH_PREFIX.length).trim();
  if (!base64url) return null;
  try {
    let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    if (pad) base64 += '='.repeat(4 - pad);
    const json = decodeURIComponent(escape(atob(base64)));
    const counts = JSON.parse(json) as number[];
    const expected = catalogSlotCount();
    if (!Array.isArray(counts) || counts.length !== expected) return null;
    const clamped = counts.map((n) => Math.max(0, Math.min(99, Number(n) || 0)));
    return clamped;
  } catch {
    return null;
  }
}

/** Build full share URL with current origin and path. */
export function buildShareUrl(data: ParseResult): string {
  const payload = encodeState(data);
  const base = typeof window !== 'undefined'
    ? window.location.origin + window.location.pathname
    : '';
  return `${base}#${HASH_PREFIX}${payload}`;
}

/** From counts array (e.g. from decodeState), produce ParseResult. */
export function stateToResult(counts: number[]): ParseResult {
  const albums = catalogToAlbums(counts);
  return resultFromAlbums(albums);
}
