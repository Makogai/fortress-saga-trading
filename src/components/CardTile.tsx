import type { ParsedCard } from '../parser/parseCards';
import { getRarityLabel } from '../parser/parseCards';
import {
  getHaveTileClasses,
  getTradeTileClasses,
  type ColorTheme,
} from '../lib/themes';

function getHaveTileClassesLight(colorTheme: ColorTheme): string {
  const map: Record<ColorTheme, string> = {
    warm: 'border-l-emerald-500 border border-emerald-400/50 bg-emerald-50',
    cool: 'border-l-emerald-500 border border-emerald-400/50 bg-emerald-50',
    forest: 'border-l-green-500 border border-green-400/50 bg-green-50',
    season: 'border-l-emerald-500 border border-emerald-400/50 bg-emerald-50',
  };
  return map[colorTheme];
}

function getTradeTileClassesLight(colorTheme: ColorTheme): string {
  const map: Record<ColorTheme, string> = {
    warm: 'border-l-amber-500 border border-amber-400/50 bg-amber-50',
    cool: 'border-l-indigo-500 border border-indigo-400/50 bg-indigo-50',
    forest: 'border-l-teal-500 border border-teal-400/50 bg-teal-50',
    season: 'border-l-[#D69858] border border-[#D69858]/70 bg-amber-50',
  };
  return map[colorTheme];
}

const RARITY_CLASSES: Record<string, { badge: string; border: string }> = {
  U: { badge: 'bg-green-600/90 text-green-100', border: 'border-green-500/40' },
  R: { badge: 'bg-blue-600/90 text-blue-100', border: 'border-blue-500/40' },
  E: { badge: 'bg-purple-600/90 text-purple-100', border: 'border-purple-500/40' },
  L: { badge: 'bg-amber-500/90 text-amber-950', border: 'border-amber-400/40' },
};

const TRADE_BADGE: Record<ColorTheme, string> = {
  warm: 'bg-amber-500/80 text-amber-950',
  cool: 'bg-indigo-500/80 text-white',
  forest: 'bg-teal-500/80 text-white',
  season: 'bg-[#D69858]/90 text-[#EAD7C2]',
};

interface CardTileProps {
  card: ParsedCard;
  editable?: boolean;
  colorTheme?: ColorTheme;
  isDark?: boolean;
  onCountChange?: (count: number) => void;
}

export function CardTile({ card, editable, colorTheme = 'warm', isDark = true, onCountChange }: CardTileProps) {
  const styles = RARITY_CLASSES[card.rarity] ?? RARITY_CLASSES.U;
  const isMissing = card.status === 'missing';
  const isDuplicate = card.status === 'duplicate';
  const owned = card.status === 'owned';

  const haveClasses = isDark ? getHaveTileClasses(colorTheme) : getHaveTileClassesLight(colorTheme);
  const tradeClasses = isDark ? getTradeTileClasses(colorTheme) : getTradeTileClassesLight(colorTheme);
  const tradeBadge = TRADE_BADGE[colorTheme];

  const missingClasses = isDark
    ? 'border-l-rose-500 border border-rose-500/60 bg-rose-950/25'
    : 'border-l-rose-500 border border-rose-400/60 bg-rose-50';
  const nameClass = isDark ? 'text-stone-100' : 'text-stone-800';
  const inputClass = isDark
    ? 'border-white/20 bg-white/10 text-stone-100 placeholder-stone-500 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20'
    : 'border-stone-300 bg-white text-stone-800 placeholder-stone-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20';
  const stepBtnClass = isDark
    ? 'bg-white/10 hover:bg-white/20 text-stone-300 active:bg-white/25'
    : 'bg-stone-100 hover:bg-stone-200 text-stone-600 active:bg-stone-300';
  const editControlBorder = isDark ? 'border-white/20' : 'border-stone-300';
  const missingIconClass = isDark ? 'text-rose-400' : 'text-rose-600';

  const handleStep = (delta: number) => {
    const next = Math.max(0, Math.min(99, card.count + delta));
    onCountChange?.(next);
  };

  return (
    <div
      className={`
        relative rounded-xl border flex flex-col justify-center border-l-4
        shadow-sm transition-all duration-200
        ${editable ? 'focus-within:shadow-md focus-within:ring-2 focus-within:ring-amber-500/25 focus-within:border-amber-500/40' : ''}
        ${isMissing ? `min-h-[3.5rem] md:min-h-[2.75rem] py-3 px-4 md:py-2.5 md:px-3 ${missingClasses}` : 'min-h-[3.5rem] md:min-h-[2.5rem]'}
        ${owned ? haveClasses : ''}
        ${isDuplicate ? tradeClasses : ''}
        ${!isMissing ? 'md:rounded-xl' : ''}
      `}
    >
      <div className={`flex flex-col min-h-0 ${isMissing ? 'px-0 py-0' : 'px-3 md:px-2 py-2 md:py-1.5'} ${editable ? 'gap-2' : ''}`}>
        <div className={`flex items-start gap-2 md:gap-1.5 min-h-0 flex-1 ${!editable ? 'flex-nowrap' : ''}`}>
          <span
            className={`inline-flex shrink-0 rounded-md px-2 md:px-1.5 py-0.5 text-xs md:text-[10px] font-bold ${styles.badge}`}
            title={getRarityLabel(card.rarity)}
          >
            {card.rarity}
          </span>
          <span
            className={`${nameClass} text-sm md:text-xs font-medium leading-snug flex-1 min-w-0 break-words max-w-[10rem] md:max-w-[8rem]`}
            title={card.name}
          >
            {card.name}
          </span>
          {isDuplicate && !editable && (
            <span
              className={`shrink-0 rounded-md px-2 md:px-1.5 py-0.5 text-xs md:text-[10px] font-bold ${tradeBadge}`}
            >
              TRADE ×{card.count - 1}
            </span>
          )}
          {isMissing && !editable && (
            <span
              className={`${missingIconClass} text-lg md:text-sm shrink-0`}
              title="Missing"
            >
              ❌
            </span>
          )}
        </div>
        {editable && (
          <div className={`flex items-center justify-center shrink-0`}>
            <div className={`flex items-center rounded-xl border overflow-hidden shadow-sm ${editControlBorder} ${isDark ? 'bg-white/5' : 'bg-stone-50'}`}>
              <button
                type="button"
                onClick={() => handleStep(-1)}
                disabled={card.count <= 0}
                className={`flex items-center justify-center w-9 h-9 md:w-8 md:h-8 touch-manipulation disabled:opacity-40 disabled:pointer-events-none font-bold text-base ${stepBtnClass}`}
                aria-label={`Decrease count for ${card.name}`}
              >
                −
              </button>
              <input
                type="number"
                min={0}
                max={99}
                value={card.count}
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10);
                  if (!Number.isNaN(n) && n >= 0) onCountChange?.(n);
                }}
                className={`w-11 md:w-9 h-9 md:h-8 text-center text-sm font-semibold touch-manipulation [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${inputClass}`}
                aria-label={`Count for ${card.name}`}
              />
              <button
                type="button"
                onClick={() => handleStep(1)}
                disabled={card.count >= 99}
                className={`flex items-center justify-center w-9 h-9 md:w-8 md:h-8 touch-manipulation disabled:opacity-40 disabled:pointer-events-none font-bold text-base ${stepBtnClass}`}
                aria-label={`Increase count for ${card.name}`}
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>
      {/* {isDuplicate && !editable && (
        <div
          className={`px-3 md:px-1.5 pb-2 md:pb-1 text-xs md:text-[10px] font-bold ${isDark ? tradeTextClass : tradeTextClassLight}`}
        >
          ×{card.count - 1}
        </div>
      )} */}
    </div>
  );
}
