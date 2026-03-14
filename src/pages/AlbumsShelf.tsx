import { useState } from 'react';
import type { ParseResult } from '../parser/parseCards';
import type { ThemeClasses } from '../lib/themes';
import { CATALOG } from '../data/catalog';
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
  data: ParseResult | null;
  onOpenAlbum: (slug: string) => void;
  isDark: boolean;
  themeClasses: ThemeClasses;
}

export function AlbumsShelf({ data, onOpenAlbum, isDark, themeClasses }: AlbumsShelfProps) {
  const t = themeClasses;
  const totalCards = CATALOG.length * CARDS_PER_ALBUM;
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          <aside className="lg:col-span-5 flex">
            <div
              className={`rounded-2xl border-2 p-6 shadow-xl flex flex-col w-full min-h-0 ${t.surface} ${t.border}`}
            >
              <h2 className={`text-xl font-bold mb-4 ${t.primary}`}>
                {SEASON_TITLE}
              </h2>
              <div
                className={`aspect-[4/3] rounded-xl border-2 overflow-hidden flex-shrink-0 ${t.border} ${isDark ? 'bg-stone-800/60' : 'bg-stone-200/80'}`}
              >
                <SeasonCoverImage textMuted={t.textMuted} />
              </div>
              <div className="mt-5 flex-shrink-0">
                <p className={`text-base font-semibold mb-2 ${t.textMuted}`}>
                  Album Completion
                </p>
                <div
                  className={`h-5 rounded-full overflow-hidden border ${t.border} ${isDark ? 'bg-stone-800' : 'bg-stone-300/60'}`}
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
              className={`rounded-2xl border-2 p-6 shadow-xl w-full min-h-0 flex flex-col ${t.surface} ${t.border}`}
            >
              <h3 className={`text-lg font-bold mb-5 ${t.primary}`}>
                Albums
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 flex-1 min-h-0 content-start">
                {CATALOG.map((album) => {
                  const slug = titleToSlug(album.title);
                  const owned = getAlbumProgress(data, album.title);
                  const progress = owned / CARDS_PER_ALBUM;
                  return (
                    <button
                      key={album.title}
                      type="button"
                      onClick={() => onOpenAlbum(slug)}
                      className={`group text-left rounded-xl border-2 overflow-hidden transition-transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 flex flex-col ${t.surface} ${t.border} focus-visible:ring-amber-500`}
                    >
                      <div
                        className={`aspect-[3/4] flex items-center justify-center overflow-hidden border-b-2 p-2 ${t.border} ${isDark ? 'bg-stone-800/60' : 'bg-stone-200/80'}`}
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
