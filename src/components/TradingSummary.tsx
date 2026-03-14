import type { TradeEntry, NeedEntry } from '../parser/parseCards';
import type { ThemeClasses } from '../lib/themes';

interface TradingSummaryProps {
  tradeList: TradeEntry[];
  needList: NeedEntry[];
  themeClasses?: ThemeClasses;
}

export function TradingSummary({ tradeList, needList, themeClasses }: TradingSummaryProps) {
  const tradeCount = tradeList.reduce((sum, e) => sum + e.count, 0); // total copies to trade
  const needCount = needList.length;
  const t = themeClasses;
  const tradeHeading = t?.trade ?? 'text-amber-300';
  const needHeading = t?.need ?? 'text-rose-300';
  const tradeSectionBorder = t?.tradeBorder ?? 'border-amber-500/50';
  const tradeSectionBg = t?.tradeBg ?? 'bg-amber-950/30';
  const needSectionBorder = t?.needBorder ?? 'border-rose-500/50';
  const needSectionBg = t?.needBg ?? 'bg-rose-950/20';
  const muted = t?.textMuted ?? 'text-stone-500';
  const text = t?.text ?? 'text-stone-200';

  return (
    <div className="max-w-3xl mx-auto">
      <p className={`text-base md:text-xs mb-4 md:mb-2 text-center ${muted}`}>
        {tradeCount > 0 && needCount > 0 && (
          <span>
            <span className={`font-medium ${t?.trade ?? 'text-amber-400'}`}>{tradeCount} to trade</span>
            {' · '}
            <span className={`font-medium ${t?.need ?? 'text-rose-400'}`}>{needCount} needed</span>
          </span>
        )}
        {tradeCount > 0 && needCount === 0 && (
          <span className={`font-medium ${t?.trade ?? 'text-amber-400'}`}>{tradeCount} to trade</span>
        )}
        {tradeCount === 0 && needCount > 0 && (
          <span className={`font-medium ${t?.need ?? 'text-rose-400'}`}>{needCount} needed</span>
        )}
        {tradeCount === 0 && needCount === 0 && (
          <span>Complete — nothing to trade or need</span>
        )}
      </p>
      <div className="flex flex-col md:flex-row gap-5 md:gap-3 justify-center items-stretch">
        <section className={`rounded-xl border ${tradeSectionBorder} ${tradeSectionBg} p-5 md:p-3 flex-1`}>
          <h3 className={`text-base md:text-sm font-bold ${tradeHeading} mb-3 md:mb-1.5`}>TRADE</h3>
          <ul className={`space-y-2 md:space-y-0.5 text-sm ${text}`}>
            {tradeList.length === 0 ? (
              <li className={`italic ${muted}`}>None</li>
            ) : (
              tradeList.map(({ album, name, count }) => (
                <li key={`${album}-${name}`} className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-1 break-words">
                  <span className={`shrink-0 text-xs ${muted}`}>{album}</span>
                  <span className="min-w-0 break-words">— {name} ×{count}</span>
                </li>
              ))
            )}
          </ul>
        </section>
        <section className={`rounded-xl border ${needSectionBorder} ${needSectionBg} p-5 md:p-3 flex-1`}>
          <h3 className={`text-base md:text-sm font-bold ${needHeading} mb-3 md:mb-1.5`}>NEED</h3>
          <ul className={`space-y-2 md:space-y-0.5 text-sm ${text}`}>
            {needList.length === 0 ? (
              <li className={`italic ${muted}`}>None</li>
            ) : (
              needList.map(({ album, name }) => (
                <li key={`${album}-${name}`} className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-1 break-words">
                  <span className={`shrink-0 text-xs ${muted}`}>{album}</span>
                  <span className="min-w-0 break-words">— {name}</span>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
