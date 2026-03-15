import { useState } from 'react';
import type { CatalogAlbum } from '../data/catalog';
import type { ParseResult } from '../parser/parseCards';
import type { ThemeClasses } from '../lib/themes';
import { titleToSlug, getAlbumCoverUrl, getSeasonCoverUrl } from '../lib/albumSlug';

function AlbumCoverImage({
  slug,
  className = '',
  objectFit = 'contain',
  textMuted,
}: {
  slug: string;
  className?: string;
  objectFit?: 'contain' | 'cover';
  textMuted: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span className={`text-4xl opacity-40 ${className} ${textMuted}`}>
        📖
      </span>
    );
  }
  return (
    <img
      src={getAlbumCoverUrl(slug)}
      alt=""
      className={`w-full h-full ${className}`}
      style={{ objectFit }}
      onError={() => setFailed(true)}
    />
  );
}

function SeasonCoverImage({ className = '', textMuted }: { className?: string; textMuted: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span className={`text-4xl opacity-40 ${className} ${textMuted}`}>
        📚
      </span>
    );
  }
  return (
    <img
      src={getSeasonCoverUrl()}
      alt=""
      className={`w-full h-full ${className}`}
      style={{ objectFit: 'contain' }}
      onError={() => setFailed(true)}
    />
  );
}

const SEASON_TITLE = 'Forest of Order Season';
const CARDS_PER_ALBUM = 10;

function getAlbumProgress(data: ParseResult | null, albumTitle: string): number {
  if (!data) return 0;
  const album = data.albums.find((a) => a.title === albumTitle);
  if (!album) return 0;
  return album.cards.filter((c) => c.count >= 1).length;
}

interface AlbumsShelfProps {
  catalog: CatalogAlbum[];
  data: ParseResult | null;
  onOpenAlbum: (slug: string) => void;
  onNavigateTracker: () => void;
  favorites: string[];
  onToggleFavorite: (slug: string) => void;
  isDark: boolean;
  themeClasses: ThemeClasses;
}

export function AlbumsShelf({ catalog, data, onOpenAlbum, onNavigateTracker, favorites, onToggleFavorite, isDark, themeClasses }: AlbumsShelfProps) {
  const t = themeClasses;
  const totalCards = catalog.length * CARDS_PER_ALBUM;
  const totalOwned = data
    ? data.albums.reduce(
        (sum, a) => sum + a.cards.filter((c) => c.count >= 1).length,
        0
      )
    : 0;
  const seasonProgress = totalOwned / totalCards;

  return (
    <div
      className={`min-h-screen pb-safe ${isDark ? 'bg-stone-950' : 'bg-stone-100'}`}
    >
      <div className="container mx-auto px-5 py-6 max-w-7xl">
        {favorites.length > 0 && (
          <div className={`mb-5 rounded-2xl border p-4 flex flex-wrap items-center gap-2 shadow-sm ${themeClasses.surface} ${themeClasses.border}`}>
            <span className={`text-sm font-semibold ${themeClasses.primary}`}>Favorites</span>
            {favorites.map((slug) => {
              const album = catalog.find((a) => titleToSlug(a.title) === slug);
              if (!album) return null;
              return (
                <button
                  key={slug}
                  type="button"
                  onClick={() => onOpenAlbum(slug)}
                  className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${themeClasses.border} ${themeClasses.surfaceAlt} ${themeClasses.text} hover:opacity-90`}
                >
                  {album.title}
                </button>
              );
            })}
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          <aside className="lg:col-span-5 flex">
            <div
              className={`rounded-2xl border p-6 shadow-lg flex flex-col w-full min-h-0 ${t.surface} ${t.border}`}
            >
              <h2 className={`text-xl font-bold mb-4 tracking-tight ${t.primary}`}>
                {SEASON_TITLE}
              </h2>
              <div
                className={`aspect-[4/3] rounded-xl border overflow-hidden flex-shrink-0 ${t.border} ${isDark ? 'bg-stone-800/60' : 'bg-stone-200/80'}`}
              >
                <SeasonCoverImage textMuted={t.textMuted} />
              </div>
              <div className="mt-5 flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <p className={`text-base font-semibold ${t.textMuted}`}>
                    Season progress
                  </p>
                  <span className={`text-base font-bold ${t.primary}`} aria-label={`${Math.round(seasonProgress * 100)} percent complete`}>
                    {Math.round(seasonProgress * 100)}%
                  </span>
                </div>
                <div
                  className={`h-5 rounded-full overflow-hidden border ${t.border} ${isDark ? 'bg-stone-800' : 'bg-stone-300/60'}`}
                  role="progressbar"
                  aria-valuenow={totalOwned}
                  aria-valuemin={0}
                  aria-valuemax={totalCards}
                  aria-label="Season completion"
                >
                  <div
                    className="h-full rounded-full transition-all duration-300 bg-amber-500"
                    style={{ width: `${seasonProgress * 100}%` }}
                  />
                </div>
                <p className={`text-base mt-2 font-medium ${t.text}`}>
                  {totalOwned} / {totalCards} cards
                </p>
              </div>
            </div>
          </aside>

          <section className="lg:col-span-7 flex">
            <div
              className={`rounded-2xl border p-6 shadow-lg w-full min-h-0 flex flex-col ${t.surface} ${t.border}`}
            >
              <h3 className={`text-lg font-bold mb-2 tracking-tight ${t.primary}`}>
                Albums
              </h3>
              {totalOwned === 0 && (
                <p className={`text-sm mb-4 ${t.textMuted}`}>
                  Add counts on the{' '}
                  <button
                    type="button"
                    onClick={onNavigateTracker}
                    className={`font-medium underline ${t.primary} hover:opacity-90`}
                  >
                    Tracker
                  </button>
                  {' '}to see progress here.
                </p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 flex-1 min-h-0 content-start">
                {catalog.map((album) => {
                  const slug = titleToSlug(album.title);
                  const owned = getAlbumProgress(data, album.title);
                  const progress = owned / CARDS_PER_ALBUM;
                  return (
                    <button
                      key={album.title}
                      type="button"
                      onClick={() => onOpenAlbum(slug)}
                      className={`group text-left rounded-2xl border overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 flex flex-col relative ${t.surface} ${t.border} focus-visible:ring-amber-500`}
                    >
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onToggleFavorite(slug); }}
                        className={`absolute top-2 right-2 z-10 w-9 h-9 rounded-full flex items-center justify-center text-lg shadow-md ${favorites.includes(slug) ? 'bg-amber-500/90 text-amber-950' : isDark ? 'bg-stone-700/80 text-stone-400' : 'bg-stone-300/80 text-stone-500'} hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-1 transition-transform hover:scale-105`}
                        aria-label={favorites.includes(slug) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        ★
                      </button>
                      <div
                        className={`aspect-[3/4] flex items-center justify-center overflow-hidden border-b p-2 ${t.border} ${isDark ? 'bg-stone-800/60' : 'bg-stone-200/80'}`}
                      >
                        <AlbumCoverImage slug={slug} objectFit="contain" textMuted={t.textMuted} />
                      </div>
                      <div className="p-3">
                        <p className={`text-sm font-semibold leading-tight line-clamp-2 mb-2 ${t.text}`}>
                          {album.title}
                        </p>
                        <div
                          className={`h-2 rounded-full overflow-hidden border ${isDark ? 'bg-stone-700' : 'bg-stone-300/60'}`}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-300 bg-amber-500"
                            style={{ width: `${progress * 100}%` }}
                          />
                        </div>
                        <p className={`text-xs font-medium mt-1 opacity-90 ${t.textMuted}`}>
                          {owned}/{CARDS_PER_ALBUM}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
