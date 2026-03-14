import type { TradeEntry, NeedEntry } from '../parser/parseCards';
import { RARITY_EMOJI } from '../lib/textExport';
import type { ThemeClasses } from '../lib/themes';

interface TradingOnlyPanelProps {
  tradeList: TradeEntry[];
  needList: NeedEntry[];
  isDark?: boolean;
  themeClasses?: ThemeClasses;
}

function groupByAlbum<T extends { album: string }>(items: T[]): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const list = map.get(item.album) ?? [];
    list.push(item);
    map.set(item.album, list);
  }
  return map;
}

/** Dupes (with count) and Need only — grouped by album, rarity next to card. */
export function TradingOnlyPanel({
  tradeList,
  needList,
  isDark = true,
  themeClasses,
}: TradingOnlyPanelProps) {
  const t = themeClasses;
  const tradeByAlbum = groupByAlbum(tradeList);
  const needByAlbum = groupByAlbum(needList);

  const sectionBorder = t?.tradeBorder ?? 'border-amber-500/50';
  const sectionTradeBg = t?.tradeBg ?? (isDark ? 'bg-amber-950/30' : 'bg-amber-50');
  const sectionNeedBorder = t?.needBorder ?? 'border-rose-500/50';
  const sectionNeedBg = t?.needBg ?? (isDark ? 'bg-rose-950/20' : 'bg-rose-50');
  const headingTrade = t?.trade ?? 'text-amber-400';
  const headingNeed = t?.need ?? 'text-rose-400';
  const cardTrade = t?.trade ?? 'text-amber-200';
  const cardNeed = t?.need ?? 'text-rose-200';
  const panelBorder = t?.border ?? 'border-stone-600/40';
  const panelBg = t?.surface ?? (isDark ? 'bg-stone-900/50' : 'bg-stone-100');
  const titleClass = t?.primary ?? 'text-amber-400';
  const albumLabel = t?.textMuted ?? 'text-stone-500';

  return (
    <div className={`rounded-xl border ${panelBorder} ${panelBg} p-5 md:p-4`}>
      <h2 className={`text-base font-semibold ${titleClass} mb-3 pb-2 border-b ${panelBorder}`}>
        Trading sheet — Dupes & Need
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <section
          className={`rounded-lg border ${sectionBorder} ${sectionTradeBg} p-3`}
        >
          <h3 className={`text-sm font-bold ${headingTrade} mb-2`}>
            TRADE (dupes — how many to trade)
          </h3>
          {tradeList.length === 0 ? (
            <p className={`text-sm italic ${albumLabel}`}>None</p>
          ) : (
            <ul className="space-y-3">
              {Array.from(tradeByAlbum.entries()).map(([album, cards]) => (
                <li key={album}>
                  <p className={`text-xs font-medium ${albumLabel} mb-1`}>{album}</p>
                  <ul className="space-y-0.5 pl-0">
                    {cards.map(({ name, count, rarity }) => (
                      <li
                        key={`${album}-${name}`}
                        className={`text-sm break-words ${cardTrade}`}
                      >
                        <span className="opacity-90" title={rarity}>
                          {RARITY_EMOJI[rarity]}
                        </span>{' '}
                        <span className="break-words">{name}</span>{' '}
                        <span className="font-semibold opacity-100">×{count}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section
          className={`rounded-lg border ${sectionNeedBorder} ${sectionNeedBg} p-3`}
        >
          <h3 className={`text-sm font-bold ${headingNeed} mb-2`}>
            NEED
          </h3>
          {needList.length === 0 ? (
            <p className={`text-sm italic ${albumLabel}`}>None</p>
          ) : (
            <ul className="space-y-3">
              {Array.from(needByAlbum.entries()).map(([album, cards]) => (
                <li key={album}>
                  <p className={`text-xs font-medium ${albumLabel} mb-1`}>{album}</p>
                  <ul className="space-y-0.5 pl-0">
                    {cards.map(({ name, rarity }) => (
                      <li
                        key={`${album}-${name}`}
                        className={`text-sm break-words ${cardNeed}`}
                      >
                        <span className="opacity-90" title={rarity}>
                          {RARITY_EMOJI[rarity]}
                        </span>{' '}
                        <span className="break-words">{name}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
