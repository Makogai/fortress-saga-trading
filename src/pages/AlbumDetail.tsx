import { useState, useEffect } from 'react';
import type { ParsedCard } from '../parser/parseCards';
import { getRarityLabel } from '../parser/parseCards';
import type { Album } from '../parser/parseCards';
import type { ThemeClasses } from '../lib/themes';
import type { RarityFilter } from '../lib/filterCards';
import { cardMatches } from '../lib/filterCards';
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

function AlbumPlaceholder({ isDark }: { isDark: boolean }) {
  return (
    <div
      className={`rounded-xl border-2 border-dashed flex flex-col w-full min-w-0 items-center justify-center ${isDark ? 'border-stone-600 bg-stone-800/30' : 'border-stone-300 bg-stone-100'}`}
      style={{ height: CARD_IMAGE_HEIGHT + 52 }}
    >
      <span className={isDark ? 'text-stone-500' : 'text-stone-400'}>—</span>
    </div>
  );
}

function getAlbumBySlug(slug: string): { album: (typeof CATALOG)[0]; index: number } | null {
  const i = CATALOG.findIndex((a) => titleToSlug(a.title) === slug);
  if (i < 0) return null;
  return { album: CATALOG[i], index: i };
}

interface AlbumDetailProps {
  slug: string;
  albumData: Album | null;
  onBack: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  isDark: boolean;
  themeClasses: ThemeClasses;
  primaryBtn: string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  rarityFilter: RarityFilter;
  setRarityFilter: (r: RarityFilter) => void;
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

export function AlbumDetail({ slug, albumData, onBack, onPrev, onNext, isFavorite, onToggleFavorite, isDark, themeClasses, primaryBtn, searchQuery, setSearchQuery, rarityFilter, setRarityFilter }: AlbumDetailProps) {
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const found = getAlbumBySlug(slug);
  const coverUrl = getAlbumCoverUrl(slug);
  const t = themeClasses;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedCardIndex(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

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
  const showCard = (card: ParsedCard) => cardMatches(card, searchQuery, rarityFilter);

  return (
    <div
      className={`min-h-screen pb-safe ${isDark ? 'bg-stone-950' : 'bg-stone-100'}`}
    >
      <div className="container mx-auto px-5 py-6 max-w-6xl">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <button
            type="button"
            onClick={onBack}
            className={`rounded-xl border-2 px-5 py-3 font-medium text-sm transition-opacity hover:opacity-90 ${primaryBtn}`}
            aria-label="Back to albums"
          >
            ← Albums
          </button>
          {onPrev && (
            <button
              type="button"
              onClick={onPrev}
              className={`rounded-xl border-2 px-4 py-3 font-medium text-sm transition-opacity hover:opacity-90 ${t.border} ${t.surfaceAlt} ${t.text}`}
              aria-label="Previous album"
            >
              ← Prev
            </button>
          )}
          {onNext && (
            <button
              type="button"
              onClick={onNext}
              className={`rounded-xl border-2 px-4 py-3 font-medium text-sm transition-opacity hover:opacity-90 ${t.border} ${t.surfaceAlt} ${t.text}`}
              aria-label="Next album"
            >
              Next →
            </button>
          )}
          <div
            className={`rounded-xl border-2 px-5 py-3 flex-1 min-w-0 flex items-center gap-3 ${t.surface} ${t.border}`}
          >
            {onToggleFavorite && (
              <button
                type="button"
                onClick={onToggleFavorite}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0 ${isFavorite ? 'bg-amber-500/90 text-amber-950' : isDark ? 'bg-stone-700/80 text-stone-400' : 'bg-stone-300/80 text-stone-500'} hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-1`}
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                ★
              </button>
            )}
            <h1 className={`text-xl font-bold truncate min-w-0 ${t.primary}`}>
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

        <div className={`mb-4 flex flex-wrap items-center gap-3 ${t.textMuted}`}>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cards…"
            className={`rounded-lg border px-3 py-2 text-sm w-40 min-w-0 ${
              isDark ? 'bg-stone-800 border-stone-600 text-stone-100' : 'bg-white border-stone-300 text-stone-800'
            }`}
            aria-label="Filter by card name"
          />
          {(['', 'U', 'R', 'E', 'L'] as const).map((r) => (
            <button
              key={r || 'all'}
              type="button"
              onClick={() => setRarityFilter(r)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-medium ${rarityFilter === r ? primaryBtn : isDark ? 'bg-stone-700 hover:bg-stone-600' : 'bg-stone-200 hover:bg-stone-300'}`}
              aria-pressed={rarityFilter === r}
            >
              {r || 'All'}
            </button>
          ))}
        </div>

        <div
          className={`rounded-2xl border-2 p-4 sm:p-6 lg:p-8 shadow-xl overflow-hidden ${t.surface} ${t.border}`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 min-w-0">
            <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-5 min-w-0 max-w-full" style={{ gridTemplateRows: 'auto auto' }}>
              <div className="col-start-2 min-w-0">
                {showCard(cards[0]) ? <AlbumCardSlot slug={slug} coverUrl={coverUrl} card={cards[0]} cardIndex={0} isDark={isDark} onCardClick={setSelectedCardIndex} /> : <AlbumPlaceholder isDark={isDark} />}
              </div>
              <div className="col-start-3 min-w-0">
                {showCard(cards[1]) ? <AlbumCardSlot slug={slug} coverUrl={coverUrl} card={cards[1]} cardIndex={1} isDark={isDark} onCardClick={setSelectedCardIndex} /> : <AlbumPlaceholder isDark={isDark} />}
              </div>
              {[2, 3, 4].map((i) => (
                <div key={i} className="min-w-0">
                  {showCard(cards[i]) ? <AlbumCardSlot slug={slug} coverUrl={coverUrl} card={cards[i]} cardIndex={i} isDark={isDark} onCardClick={setSelectedCardIndex} /> : <AlbumPlaceholder isDark={isDark} />}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-5 min-w-0 max-w-full" style={{ gridTemplateRows: 'auto auto' }}>
              <div className="col-start-2 min-w-0">
                {showCard(cards[5]) ? <AlbumCardSlot slug={slug} coverUrl={coverUrl} card={cards[5]} cardIndex={5} isDark={isDark} onCardClick={setSelectedCardIndex} /> : <AlbumPlaceholder isDark={isDark} />}
              </div>
              <div className="col-start-3 min-w-0">
                {showCard(cards[6]) ? <AlbumCardSlot slug={slug} coverUrl={coverUrl} card={cards[6]} cardIndex={6} isDark={isDark} onCardClick={setSelectedCardIndex} /> : <AlbumPlaceholder isDark={isDark} />}
              </div>
              {[7, 8, 9].map((i) => (
                <div key={i} className="min-w-0">
                  {showCard(cards[i]) ? <AlbumCardSlot slug={slug} coverUrl={coverUrl} card={cards[i]} cardIndex={i} isDark={isDark} onCardClick={setSelectedCardIndex} /> : <AlbumPlaceholder isDark={isDark} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedCardIndex !== null && cards[selectedCardIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          onClick={() => setSelectedCardIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="card-modal-title"
        >
          <div
            className={`rounded-2xl border-2 overflow-hidden max-w-sm w-full shadow-xl ${t.surface} ${t.border}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative" style={{ height: CARD_IMAGE_HEIGHT + 24 }}>
              <CardImage slug={slug} cardIndex={selectedCardIndex} coverUrl={coverUrl} />
            </div>
            <div className={`p-4 border-t ${t.border}`}>
              <h2 id="card-modal-title" className={`text-lg font-bold ${t.text}`}>
                {cards[selectedCardIndex].name}
              </h2>
              <p className={`text-sm mt-1 ${t.textMuted}`}>
                {getRarityLabel(cards[selectedCardIndex].rarity)} · Count: {cards[selectedCardIndex].count}
              </p>
              <p className={`text-sm mt-2 ${cards[selectedCardIndex].status === 'missing' ? t.need : cards[selectedCardIndex].status === 'duplicate' ? t.trade : t.have}`}>
                {cards[selectedCardIndex].status === 'missing'
                  ? 'Need'
                  : cards[selectedCardIndex].status === 'duplicate'
                    ? `To trade: ${cards[selectedCardIndex].count - 1}`
                    : 'Owned'}
              </p>
            </div>
            <div className={`p-3 border-t ${t.border}`}>
              <button
                type="button"
                onClick={() => setSelectedCardIndex(null)}
                className={`w-full rounded-xl px-4 py-2.5 font-medium ${primaryBtn}`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AlbumCardSlot({
  slug,
  coverUrl,
  card,
  cardIndex,
  isDark,
  onCardClick,
}: {
  slug: string;
  coverUrl: string;
  card: ParsedCard;
  cardIndex: number;
  isDark: boolean;
  onCardClick?: (index: number) => void;
}) {
  const isOwned = card.count >= 1;
  const borderClass = RARITY_BORDER[card.rarity] ?? 'border-stone-500';

  return (
    <div
      role={onCardClick ? 'button' : undefined}
      tabIndex={onCardClick ? 0 : undefined}
      onClick={onCardClick ? () => onCardClick(cardIndex) : undefined}
      onKeyDown={onCardClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCardClick(cardIndex); } } : undefined}
      className={`rounded-xl border-2 overflow-hidden flex flex-col w-full min-w-0 ${borderClass} ${isDark ? 'bg-stone-800/50' : 'bg-stone-200/60'} ${onCardClick ? 'cursor-pointer hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500' : ''}`}
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
