import type { ParseResult, Rarity } from '../parser/parseCards';

/** Discord-ready emojis: section + rarity color. */
const EMOJI = {
  trade: '🟡',
  need: '🔴',
  dupe: '×',
} as const;

/** Rarity color emojis for Discord paste (U=green, R=blue, E=purple, L=gold). */
export const RARITY_EMOJI: Record<Rarity, string> = {
  U: '🟢',
  R: '🔵',
  E: '🟣',
  L: '🟡',
};

function groupByAlbum<T extends { album: string }>(items: T[]): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const list = map.get(item.album) ?? [];
    list.push(item);
    map.set(item.album, list);
  }
  return map;
}

export function buildTextExport(data: ParseResult): string {
  const lines: string[] = [];
  lines.push('**Fortress Saga — Trading**');
  lines.push('');

  lines.push('**TRADE** (dupes — how many to trade)');
  if (data.tradeList.length === 0) {
    lines.push('_None_');
  } else {
    const byAlbum = groupByAlbum(data.tradeList);
    for (const [album, entries] of byAlbum) {
      lines.push(`${album}`);
      for (const e of entries) {
        const r = RARITY_EMOJI[e.rarity] ?? '🟢';
        lines.push(`${r} **${e.name}** ${EMOJI.dupe}${e.count}`);
      }
      lines.push('');
    }
  }

  lines.push('**NEED**');
  if (data.needList.length === 0) {
    lines.push('_None_');
  } else {
    const byAlbum = groupByAlbum(data.needList);
    for (const [album, entries] of byAlbum) {
      lines.push(`${album}`);
      for (const e of entries) {
        const r = RARITY_EMOJI[e.rarity] ?? '🟢';
        lines.push(`${r} **${e.name}**`);
      }
      lines.push('');
    }
  }

  return lines.join('\n').replace(/\n{3,}/g, '\n\n');
}
