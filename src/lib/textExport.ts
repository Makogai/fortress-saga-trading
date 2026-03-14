import type { ParseResult, Rarity } from '../parser/parseCards';

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
  lines.push('**Fortress Saga — Trading**\n');

  lines.push('**TRADE**');
  if (data.tradeList.length === 0) {
    lines.push('_None_\n');
  } else {
    const byAlbum = groupByAlbum(data.tradeList);
    for (const [album, entries] of byAlbum) {
      const parts = entries.map((e) => {
        const r = RARITY_EMOJI[e.rarity] ?? '🟢';
        return `${r} ${e.name} ×${e.count}`;
      });
      lines.push(`${album}: ${parts.join(', ')}`);
    }
    lines.push('');
  }

  lines.push('**NEED**');
  if (data.needList.length === 0) {
    lines.push('_None_');
  } else {
    const byAlbum = groupByAlbum(data.needList);
    for (const [album, entries] of byAlbum) {
      const parts = entries.map((e) => {
        const r = RARITY_EMOJI[e.rarity] ?? '🟢';
        return `${r} ${e.name}`;
      });
      lines.push(`${album}: ${parts.join(', ')}`);
    }
  }

  return lines.join('\n');
}
