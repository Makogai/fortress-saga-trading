import type { ParsedCard } from '../parser/parseCards';

export type RarityFilter = '' | 'U' | 'R' | 'E' | 'L';

export function matchesSearch(card: ParsedCard, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  return card.name.toLowerCase().includes(q);
}

export function matchesRarity(card: ParsedCard, rarity: RarityFilter): boolean {
  if (!rarity) return true;
  return card.rarity === rarity;
}

export function cardMatches(
  card: ParsedCard,
  searchQuery: string,
  rarityFilter: RarityFilter
): boolean {
  return matchesSearch(card, searchQuery) && matchesRarity(card, rarityFilter);
}
