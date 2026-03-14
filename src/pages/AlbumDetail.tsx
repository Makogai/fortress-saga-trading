import { useState } from 'react';
import type { ParsedCard } from '../parser/parseCards';
import type { Album } from '../parser/parseCards';
import type { ThemeClasses } from '../lib/themes';
import { CATALOG } from '../data/catalog';
import { titleToSlug, getCardImageUrl, getAlbumCoverUrl } from '../lib/albumSlug';

const RARITY_BORDER: Record<string, string> = {
  U: 'border-green-500',
  R: 'border-blue-500',
  E: 'border-purple-500',
  L: 'border-amber-400',
};

const CARDS_PER_ALBUM = 10;
const CARD_IMAGE_HEIGHT = 220;

function getAlbumBySlug(slug: string): { album: (typeof CATALOG)[0]; index: number } | null {
  const i = CATALOG.findIndex((a) => titleToSlug(a.title) === slug);
  if (i < 0) return null;
  return { album: CATALOG[i], index: i };
}

interface AlbumDetailProps {
  slug: string;
  albumData: Album | null;
  onBack: () => void;
  isDark: boolean;
  themeClasses: ThemeClasses;
  primaryBtn: string;
}

function CardImage({
  slug,
  cardIndex,
  coverUrl,
}: {
  slug: string;
  cardIndex: number;
  coverUrl: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = getCardImageUrl(slug, cardIndex);
  if (failed) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-stone-800/50">
        <img
          src={coverUrl}
          alt=""
          className="max-w-[55%] max-h-[55%] w-auto h-auto object-contain opacity-80"
        />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt=""
      className="w-full h-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}

export function AlbumDetail({ slug, albumData, onBack, isDark, themeClasses, primaryBtn }: AlbumDetailProps) {
  const found = getAlbumBySlug(slug);
  const coverUrl = getAlbumCoverUrl(slug);
  const t = themeClasses;

  if (!found) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center pb-safe ${isDark ? 'bg-stone-950' : 'bg-stone-100'}`}
      >
        <div className="text-center">
          <p className={t.textMuted}>Album not found</p>
          <button
            type="button"
            onClick={onBack}
            className={`mt-4 px-5 py-2.5 rounded-xl font-medium border-2 ${t.border} ${t.surfaceAlt} ${t.text} hover:opacity-90`}
          >
            Back to albums
          </button>
        </div>
      </div>
    );
  }

  const { album: catalogAlbum } = found;
  const cards: ParsedCard[] = albumData
    ? albumData.cards
    : catalogAlbum.cards.map((c) => ({
        ...c,
        count: 0,
        status: 'missing' as const,
      }));
  const owned = cards.filter((c) => c.count >= 1).length;
  const progress = owned / CARDS_PER_ALBUM;

  return (
    <div
      className={`min-h-screen pb-safe ${isDark ? 'bg-stone-950' : 'bg-stone-100'}`}
    >
      <div className="container mx-auto px-5 py-6 max-w-6xl">
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <button
            type="button"
            onClick={onBack}
            className={`rounded-xl border-2 px-5 py-3 font-medium text-sm transition-opacity hover:opacity-90 ${primaryBtn}`}
          >
            ← Albums
          </button>
          <div
            className={`rounded-xl border-2 px-5 py-3 flex-1 min-w-0 ${t.surface} ${t.border}`}
          >
            <h1 className={`text-xl font-bold truncate ${t.primary}`}>
              {catalogAlbum.title}
            </h1>
            <div className="flex items-center gap-4 mt-3">
              <div
                className={`flex-1 h-3 rounded-full overflow-hidden border ${t.border} ${isDark ? 'bg-stone-800' : 'bg-stone-300/60'}`}
              >
                <div
                  className="h-full rounded-full transition-all duration-300 bg-amber-500"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <span className={`text-base font-semibold shrink-0 ${t.text}`}>
                {owned}/{CARDS_PER_ALBUM}
              </span>
            </div>
          </div>
        </div>

        <div
          className={`rounded-2xl border-2 p-4 sm:p-6 lg:p-8 shadow-xl overflow-hidden ${t.surface} ${t.border}`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 min-w-0">
            {/* Page 1: 3-col grid so top row (2 cards) and bottom row (3 cards) share same cell size */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-5 min-w-0 max-w-full" style={{ gridTemplateRows: 'auto auto' }}>
              <div className="col-start-2 min-w-0">
                <AlbumCardSlot slug={slug} coverUrl={coverUrl} card={cards[0]} cardIndex={0} isDark={isDark} />
              </div>
              <div className="col-start-3 min-w-0">
                <AlbumCardSlot slug={slug} coverUrl={coverUrl} card={cards[1]} cardIndex={1} isDark={isDark} />
              </div>
              {[2, 3, 4].map((i) => (
                <div key={i} className="min-w-0">
                  <AlbumCardSlot slug={slug} coverUrl={coverUrl} card={cards[i]} cardIndex={i} isDark={isDark} />
                </div>
              ))}
            </div>
            {/* Page 2 */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-5 min-w-0 max-w-full" style={{ gridTemplateRows: 'auto auto' }}>
              <div className="col-start-2 min-w-0">
                <AlbumCardSlot slug={slug} coverUrl={coverUrl} card={cards[5]} cardIndex={5} isDark={isDark} />
              </div>
              <div className="col-start-3 min-w-0">
                <AlbumCardSlot slug={slug} coverUrl={coverUrl} card={cards[6]} cardIndex={6} isDark={isDark} />
              </div>
              {[7, 8, 9].map((i) => (
                <div key={i} className="min-w-0">
                  <AlbumCardSlot slug={slug} coverUrl={coverUrl} card={cards[i]} cardIndex={i} isDark={isDark} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AlbumCardSlot({
  slug,
  coverUrl,
  card,
  cardIndex,
  isDark,
}: {
  slug: string;
  coverUrl: string;
  card: ParsedCard;
  cardIndex: number;
  isDark: boolean;
}) {
  const isOwned = card.count >= 1;
  const borderClass = RARITY_BORDER[card.rarity] ?? 'border-stone-500';

  return (
    <div
      className={`rounded-xl border-2 overflow-hidden flex flex-col w-full min-w-0 ${borderClass} ${isDark ? 'bg-stone-800/50' : 'bg-stone-200/60'}`}
      style={{ height: CARD_IMAGE_HEIGHT + 52 }}
    >
      <div
        className="relative flex-1 min-h-0 w-full flex-shrink-0"
        style={{ height: CARD_IMAGE_HEIGHT }}
      >
        <CardImage slug={slug} cardIndex={cardIndex} coverUrl={coverUrl} />
        {!isOwned && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-sm font-bold px-2 text-center">
            Not Owned
          </div>
        )}
        {isOwned && card.count > 1 && (
          <div className="absolute top-2 right-2 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold bg-amber-500 text-amber-950">
            +{card.count - 1}
          </div>
        )}
      </div>
      <div
        className={`py-2.5 px-3 text-center border-t flex-shrink-0 flex items-center justify-center min-h-[52px] ${isDark ? 'border-stone-600/50 bg-stone-900/40' : 'border-stone-300 bg-stone-300/40'}`}
      >
        <p className={`text-sm font-medium leading-tight truncate w-full ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>
          {card.name}
        </p>
      </div>
    </div>
  );
}
