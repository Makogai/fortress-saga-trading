import type { Album, ParsedCard } from '../parser/parseCards';
import type { ColorTheme } from '../lib/themes';
import type { RarityFilter } from '../lib/filterCards';
import { cardMatches } from '../lib/filterCards';
import { CardTile } from './CardTile';
import { CountSlot } from './CountSlot';

export type ViewMode = 'full' | 'needOnly' | 'haveOnly' | 'counts';

interface AlbumGridProps {
  album: Album;
  viewMode: ViewMode;
  editable?: boolean;
  colorTheme?: ColorTheme;
  isDark?: boolean;
  onCardCountChange?: (cardIndex: number, count: number) => void;
  searchQuery?: string;
  rarityFilter?: RarityFilter;
}

/** Game layout: 2 pages, 5 per page. Each page: 2 centered on top, 3 centered on bottom. */
const PAGE1_INDICES = [0, 1, 2, 3, 4];
const PAGE2_INDICES = [5, 6, 7, 8, 9];

function PageGrid({
  cards,
  viewMode,
  pageKey,
  editable,
  colorTheme,
  onCardCountChange,
  cardOffset,
  filterMatch,
  isDark = true,
}: {
  cards: (ParsedCard | undefined)[];
  viewMode: ViewMode;
  pageKey: string;
  editable?: boolean;
  colorTheme?: ColorTheme;
  onCardCountChange?: (cardIndex: number, count: number) => void;
  cardOffset: number;
  filterMatch?: (card: ParsedCard) => boolean;
  isDark?: boolean;
}) {
  const top = cards.slice(0, 2);
  const bottom = cards.slice(2, 5);
  const matches = filterMatch ?? (() => true);

  if (viewMode === 'counts') {
    return (
      <div className="flex flex-col gap-2 sm:gap-2.5">
        <div className="flex justify-center gap-2 sm:gap-2.5">
          {[0, 1].map((i) => {
            const card = top[i];
            const show = card && matches(card);
            return (
              <CountSlot
                key={`${pageKey}-t-${i}`}
                card={show ? card : undefined}
                slotIndex={i}
                isDark={isDark}
              />
            );
          })}
        </div>
        <div className="flex justify-center gap-2 sm:gap-2.5">
          {[0, 1, 2].map((i) => {
            const card = bottom[i];
            const show = card && matches(card);
            return (
              <CountSlot
                key={`${pageKey}-b-${i}`}
                card={show ? card : undefined}
                slotIndex={i + 2}
                isDark={isDark}
              />
            );
          })}
        </div>
      </div>
    );
  }

  const showSlot = (card: ParsedCard) => {
    if (!card) return false;
    if (!matches(card)) return false;
    if (viewMode === 'needOnly') return card.status === 'missing';
    if (viewMode === 'haveOnly') return card.status !== 'missing';
    return true;
  };

  const emptySlotClass = isDark
    ? 'rounded-xl border border-stone-600/30 bg-stone-800/30 min-h-[3.5rem] md:min-h-[2.75rem] py-3 px-4 md:py-2 md:px-3 flex items-center justify-center text-stone-500 text-sm md:text-xs'
    : 'rounded-xl border border-stone-300 bg-stone-200/60 min-h-[3.5rem] md:min-h-[2.75rem] py-3 px-4 md:py-2 md:px-3 flex items-center justify-center text-stone-500 text-sm md:text-xs';

  const renderSlot = (card: ParsedCard | undefined, key: string, index: number) => {
    if (!card)
      return (
        <div key={key} className={emptySlotClass} aria-hidden>
          —
        </div>
      );
    if (!showSlot(card)) {
      return (
        <div key={key} className={emptySlotClass}>
          {!matches(card) ? '—' : viewMode === 'needOnly' ? '—' : 'Need'}
        </div>
      );
    }
    return (
      <CardTile
        key={key}
        card={card}
        editable={editable}
        colorTheme={colorTheme}
        isDark={isDark}
        onCountChange={
          onCardCountChange ? (n) => onCardCountChange(index, n) : undefined
        }
      />
    );
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-center gap-1.5">
        {top.map((card, i) =>
          renderSlot(card, `${pageKey}-t-${i}`, cardOffset + i)
        )}
      </div>
      <div className="flex justify-center gap-1.5">
        {bottom.map((card, i) =>
          renderSlot(card, `${pageKey}-b-${i}`, cardOffset + 2 + i)
        )}
      </div>
    </div>
  );
}

export function AlbumGrid({
  album,
  viewMode,
  editable,
  colorTheme = 'warm',
  isDark = true,
  onCardCountChange,
  searchQuery = '',
  rarityFilter = '',
}: AlbumGridProps) {
  const cards = album.cards;
  const filterMatch = (card: ParsedCard) =>
    cardMatches(card, searchQuery, rarityFilter);
  const page1 = PAGE1_INDICES.map((i) => cards[i]);
  const page2 = PAGE2_INDICES.map((i) => cards[i]);
  const titleClass =
    colorTheme === 'cool'
      ? isDark ? 'text-sky-300' : 'text-sky-700'
      : colorTheme === 'forest'
        ? isDark ? 'text-emerald-300' : 'text-emerald-700'
        : isDark ? 'text-amber-200/90' : 'text-amber-800';

  const showCard = (card: ParsedCard) => {
    if (!filterMatch(card)) return false;
    if (viewMode === 'needOnly') return card.status === 'missing';
    if (viewMode === 'haveOnly') return card.status !== 'missing';
    return true;
  };

  const isCountsView = viewMode === 'counts';

  /** Counts view: keep 2-page grid on all screen sizes — compact and readable. */
  const countsGrid = isCountsView && (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      <PageGrid
        cards={page1}
        viewMode="counts"
        pageKey="p1"
        editable={editable}
        colorTheme={colorTheme}
        onCardCountChange={onCardCountChange}
        cardOffset={0}
        filterMatch={filterMatch}
        isDark={isDark}
      />
      <PageGrid
        cards={page2}
        viewMode="counts"
        pageKey="p2"
        editable={editable}
        colorTheme={colorTheme}
        onCardCountChange={onCardCountChange}
        cardOffset={5}
        filterMatch={filterMatch}
        isDark={isDark}
      />
    </div>
  );

  /** Mobile (non-counts): single-column list for readable card names. */
  const mobileList = !isCountsView && (
    <div className="md:hidden space-y-2">
      {cards.map((card, i) =>
        !showCard(card) ? (
          <div
            key={i}
            className={`rounded-xl border min-h-[3.5rem] py-3 px-4 flex items-center justify-center text-stone-500 text-sm ${
              isDark ? 'border-stone-600/30 bg-stone-800/30' : 'border-stone-300 bg-stone-200/60'
            }`}
          >
            {!filterMatch(card) ? '—' : viewMode === 'needOnly' ? '—' : 'Need'}
          </div>
        ) : (
          <CardTile
            key={i}
            card={card}
            editable={editable}
            colorTheme={colorTheme}
            isDark={isDark}
            onCountChange={
              onCardCountChange ? (n) => onCardCountChange(i, n) : undefined
            }
          />
        )
      )}
    </div>
  );

  /** Desktop (non-counts): 2-page grid. */
  const desktopGrid = !isCountsView && (
    <div className="hidden md:grid grid-cols-2 gap-4">
      <PageGrid
        cards={page1}
        viewMode={viewMode}
        pageKey="p1"
        editable={editable}
        colorTheme={colorTheme}
        onCardCountChange={onCardCountChange}
        cardOffset={0}
        filterMatch={filterMatch}
        isDark={isDark}
      />
      <PageGrid
        cards={page2}
        viewMode={viewMode}
        pageKey="p2"
        editable={editable}
        colorTheme={colorTheme}
        onCardCountChange={onCardCountChange}
        cardOffset={5}
        filterMatch={filterMatch}
        isDark={isDark}
      />
    </div>
  );

  const containerClass = isDark
    ? 'rounded-xl border border-stone-600/40 bg-stone-800/30'
    : 'rounded-xl border border-stone-300 bg-stone-100/80';
  const borderClass = isDark ? 'border-stone-600/40' : 'border-stone-300';

  return (
    <div
      className={`${containerClass} ${
        isCountsView ? 'p-4 sm:p-5' : 'p-4 md:p-2.5'
      }`}
    >
      <h2
        className={`text-base md:text-sm font-semibold ${titleClass} ${
          isCountsView ? 'mb-3 sm:mb-4 pb-3 sm:pb-4' : 'mb-3 md:mb-2 pb-3 md:pb-1.5'
        } border-b ${borderClass} flex items-center justify-between gap-2`}
      >
        <span>{album.title}</span>
        <span className="text-xs font-medium shrink-0 text-stone-500">
          {album.cards.filter((c) => c.count >= 1).length}/{album.cards.length}
        </span>
      </h2>
      {countsGrid}
      {mobileList}
      {desktopGrid}
    </div>
  );
}
