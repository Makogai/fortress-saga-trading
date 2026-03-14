export type Rarity = 'U' | 'R' | 'E' | 'L';

export type CardStatus = 'missing' | 'owned' | 'duplicate';

export interface ParsedCard {
  rarity: Rarity;
  name: string;
  count: number;
  status: CardStatus;
}

export interface Album {
  title: string;
  cards: ParsedCard[];
}

export interface TradeEntry {
  album: string;
  name: string;
  count: number;
  rarity: Rarity;
}

export interface NeedEntry {
  album: string;
  name: string;
  rarity: Rarity;
}

export interface ParseResult {
  albums: Album[];
  tradeList: TradeEntry[];
  needList: NeedEntry[];
}

const RARITY_PATTERN = /^([UREL])\s+(.+)$/i;

function parseLine(line: string): ParsedCard | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const commaIdx = trimmed.lastIndexOf(',');
  if (commaIdx === -1) return null;

  const rest = trimmed.slice(0, commaIdx).trim();
  const countStr = trimmed.slice(commaIdx + 1).trim();
  const count = parseInt(countStr, 10);
  if (Number.isNaN(count) || count < 0) return null;

  const match = rest.match(RARITY_PATTERN);
  if (!match) return null;

  const rarity = match[1].toUpperCase() as Rarity;
  const name = match[2].trim();
  if (!name) return null;

  const status: CardStatus =
    count === 0 ? 'missing' : count === 1 ? 'owned' : 'duplicate';

  return { rarity, name, count, status };
}

export function parseCardsText(text: string): ParseResult {
  const lines = text.split(/\r?\n/);
  const albums: Album[] = [];
  const allTrade: TradeEntry[] = [];
  const allNeed: NeedEntry[] = [];
  let currentAlbum: Album | null = null;

  for (const line of lines) {
    const card = parseLine(line);
    if (card) {
      if (!currentAlbum) {
        currentAlbum = { title: 'Unknown Album', cards: [] };
        albums.push(currentAlbum);
      }
      currentAlbum.cards.push(card);
      const albumTitle = currentAlbum.title;
      if (card.status === 'duplicate') {
        allTrade.push({
          album: albumTitle,
          name: card.name,
          count: card.count - 1, // number available to trade (duplicates only)
          rarity: card.rarity,
        });
      }
      if (card.status === 'missing') {
        allNeed.push({ album: albumTitle, name: card.name, rarity: card.rarity });
      }
      continue;
    }

    const trimmed = line.trim();
    if (trimmed) {
      currentAlbum = { title: trimmed, cards: [] };
      albums.push(currentAlbum);
    }
  }

  return {
    albums,
    tradeList: allTrade,
    needList: allNeed,
  };
}

export function getRarityLabel(r: Rarity): string {
  const labels: Record<Rarity, string> = {
    U: 'Uncommon',
    R: 'Rare',
    E: 'Epic',
    L: 'Legendary',
  };
  return labels[r] ?? r;
}

/** Ensure each card has status derived from count. */
export function normalizeAlbums(albums: Album[]): Album[] {
  return albums.map((a) => ({
    ...a,
    cards: a.cards.map((c) => {
      const status: CardStatus =
        c.count === 0 ? 'missing' : c.count === 1 ? 'owned' : 'duplicate';
      return { ...c, status };
    }),
  }));
}

/** Recompute trade/need lists from albums. */
export function resultFromAlbums(albums: Album[]): ParseResult {
  const normalized = normalizeAlbums(albums);
  const tradeList: TradeEntry[] = [];
  const needList: NeedEntry[] = [];
  for (const album of normalized) {
    for (const card of album.cards) {
      if (card.status === 'duplicate') {
        tradeList.push({
          album: album.title,
          name: card.name,
          count: card.count - 1, // number available to trade (duplicates only)
          rarity: card.rarity,
        });
      }
      if (card.status === 'missing') {
        needList.push({
          album: album.title,
          name: card.name,
          rarity: card.rarity,
        });
      }
    }
  }
  return { albums: normalized, tradeList, needList };
}

/** Set count for a card and return new ParseResult. */
export function setCardCount(
  prev: ParseResult,
  albumTitle: string,
  cardIndex: number,
  count: number
): ParseResult {
  const albums = prev.albums.map((a) => {
    if (a.title !== albumTitle) return a;
    const cards = a.cards.map((c, i) => {
      if (i !== cardIndex) return c;
      const status: CardStatus =
        count === 0 ? 'missing' : count === 1 ? 'owned' : 'duplicate';
      return { ...c, count, status };
    });
    return { ...a, cards };
  });
  return resultFromAlbums(albums);
}
