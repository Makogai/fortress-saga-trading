import type { Rarity, Album, ParsedCard } from '../parser/parseCards';

/**
 * Single-season catalog (Forest of Order). Multi-season support could add a season id
 * and multiple catalog sources with a selector in the UI.
 */

/** One card in the catalog (no count — count comes from user input or import). */
export interface CatalogCard {
  rarity: Rarity;
  name: string;
}

export interface CatalogAlbum {
  title: string;
  cards: CatalogCard[];
}

/** Fixed order: albums and cards match in-game layout (page 1: slots 1–5, page 2: slots 6–10). */
export const CATALOG: CatalogAlbum[] = [
  {
    title: 'Equipment Album',
    cards: [
      { rarity: 'U', name: 'Caligo Pride' },
      { rarity: 'U', name: 'Sky Dragonbone Sword' },
      { rarity: 'U', name: "Hero's Conviction" },
      { rarity: 'U', name: 'Lucid Bells of Repentance' },
      { rarity: 'U', name: 'Undying Blade Gloves' },
      { rarity: 'U', name: 'Dark Void Staff' },
      { rarity: 'U', name: 'burning Dusk Sky' },
      { rarity: 'R', name: "Judicator's Holy Teachings" },
      { rarity: 'R', name: 'Peerless Golden Gauntlet' },
      { rarity: 'R', name: 'Machina Missile X' },
    ],
  },
  {
    title: 'Monster Album',
    cards: [
      { rarity: 'U', name: 'Minions of the Void' },
      { rarity: 'U', name: 'Frightened Kerothy' },
      { rarity: 'U', name: 'Angry Tumbleweed' },
      { rarity: 'U', name: 'Keen Zegurke' },
      { rarity: 'U', name: 'Void Phantom' },
      { rarity: 'U', name: 'Watcher Apistol' },
      { rarity: 'R', name: 'Fobos of Oblivion' },
      { rarity: 'R', name: 'Wasteland Drone' },
      { rarity: 'R', name: 'Lantern Bat' },
      { rarity: 'E', name: 'Ruins Shard' },
    ],
  },
  {
    title: 'Petite Album',
    cards: [
      { rarity: 'U', name: 'Petite Yaksha' },
      { rarity: 'U', name: 'Petite Kubera' },
      { rarity: 'U', name: 'Petite Luna' },
      { rarity: 'U', name: 'Petite Tilly' },
      { rarity: 'U', name: 'Petite Louis' },
      { rarity: 'R', name: 'Petite Iris' },
      { rarity: 'R', name: 'Petite Ravia' },
      { rarity: 'R', name: 'Petite Ungula' },
      { rarity: 'E', name: 'Petite Zelos' },
      { rarity: 'E', name: 'Petite Vajra' },
    ],
  },
  {
    title: 'Boss Album',
    cards: [
      { rarity: 'U', name: 'Archmage Wisp Brothers' },
      { rarity: 'U', name: 'Fairy Queen Wisp' },
      { rarity: 'U', name: 'Cebras' },
      { rarity: 'U', name: 'Fiance Sebastian' },
      { rarity: 'R', name: 'Disguasting Ramulus' },
      { rarity: 'R', name: 'Sunken Monaxia' },
      { rarity: 'R', name: 'Chornum' },
      { rarity: 'E', name: 'Vicious Vosek' },
      { rarity: 'E', name: 'Deus Ex Machina' },
      { rarity: 'E', name: 'Twilight Golem' },
    ],
  },
  {
    title: 'Hero Album I',
    cards: [
      { rarity: 'U', name: 'Stella' },
      { rarity: 'U', name: 'Mael' },
      { rarity: 'U', name: 'Bernhard' },
      { rarity: 'U', name: 'Amber' },
      { rarity: 'R', name: 'louis' },
      { rarity: 'R', name: 'Elizabeth' },
      { rarity: 'R', name: 'Soba' },
      { rarity: 'E', name: 'Winter' },
      { rarity: 'E', name: 'Solum' },
      { rarity: 'L', name: 'Zelos' },
    ],
  },
  {
    title: 'Fortress Album I',
    cards: [
      { rarity: 'U', name: 'Spellcrafter Fortress' },
      { rarity: 'U', name: 'Arcade Fortress' },
      { rarity: 'U', name: 'Opera Fortress' },
      { rarity: 'R', name: 'Aloha Fortress' },
      { rarity: 'R', name: 'Golden Anvil Fortress' },
      { rarity: 'R', name: 'Land Crusher Fortress' },
      { rarity: 'E', name: 'Lion King Fortress' },
      { rarity: 'E', name: 'Blooming Spring Fortress' },
      { rarity: 'L', name: 'The Real Fortress' },
      { rarity: 'L', name: 'Blue Sanctuary Fortress' },
    ],
  },
  {
    title: 'Hero Album II',
    cards: [
      { rarity: 'U', name: 'Violet' },
      { rarity: 'R', name: 'Eclipse' },
      { rarity: 'R', name: 'Kubera' },
      { rarity: 'R', name: 'Iris' },
      { rarity: 'E', name: 'Rei' },
      { rarity: 'E', name: 'Styria' },
      { rarity: 'E', name: 'Ruingaladh' },
      { rarity: 'L', name: 'Tilly' },
      { rarity: 'L', name: 'Valentine' },
      { rarity: 'L', name: 'Lan Hua' },
    ],
  },
  {
    title: 'Fortress Album II',
    cards: [
      { rarity: 'R', name: 'Machina Fortress' },
      { rarity: 'R', name: 'Christmas Fortress' },
      { rarity: 'R', name: 'Paladin Fortress' },
      { rarity: 'E', name: 'Battle Cruiser Fortress' },
      { rarity: 'E', name: 'Abyssal Shadow Fortress' },
      { rarity: 'E', name: 'Flower Guardian Fortress' },
      { rarity: 'L', name: "Devil's Castle Fortress" },
      { rarity: 'L', name: 'Heavy Tank Fortress' },
      { rarity: 'L', name: 'Halloween Fortress' },
      { rarity: 'L', name: 'Frost Fang Fortress' },
    ],
  },
];

const SLOTS_PER_ALBUM = 10;

/** Create albums with counts from a flat array: counts[i] = count for catalog slot i (row-major: album by album, 10 per album). */
export function catalogToAlbums(counts: number[]): Album[] {
  const albums: Album[] = [];
  let idx = 0;
  for (const album of CATALOG) {
    const cards: ParsedCard[] = album.cards.map((c) => {
      const count = counts[idx++] ?? 0;
      const status =
        count === 0 ? 'missing' : count === 1 ? 'owned' : 'duplicate';
      return { ...c, count, status };
    });
    albums.push({ title: album.title, cards });
  }
  return albums;
}

/** Total number of slots (albums × 10). */
export function catalogSlotCount(): number {
  return CATALOG.length * SLOTS_PER_ALBUM;
}

/** Get default counts (all 0) for clean slate. */
export function defaultCounts(): number[] {
  return new Array(catalogSlotCount()).fill(0);
}
