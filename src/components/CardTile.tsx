import type { ParsedCard } from '../parser/parseCards';
import { getRarityLabel } from '../parser/parseCards';
import {
  getHaveTileClasses,
  getTradeTileClasses,
  type ColorTheme,
} from '../lib/themes';

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
  onCountChange?: (count: number) => void;
}

export function CardTile({ card, editable, colorTheme = 'warm', onCountChange }: CardTileProps) {
  const styles = RARITY_CLASSES[card.rarity] ?? RARITY_CLASSES.U;
  const isMissing = card.status === 'missing';
  const isDuplicate = card.status === 'duplicate';
  const owned = card.status === 'owned';

  const haveClasses = getHaveTileClasses(colorTheme);
  const tradeClasses = getTradeTileClasses(colorTheme);
  const tradeBadge = TRADE_BADGE[colorTheme];

  return (
    <div
      className={`
        relative rounded-xl border flex flex-col justify-center border-l-4
        ${isMissing ? 'min-h-[3.5rem] md:min-h-[2.75rem] py-3 px-4 md:py-2.5 md:px-3 border-l-rose-500 border border-rose-500/60 bg-rose-950/25' : 'min-h-[3.5rem] md:min-h-[2.5rem]'}
        ${owned ? haveClasses : ''}
        ${isDuplicate ? tradeClasses : ''}
        ${!isMissing ? 'md:rounded-lg' : ''}
      `}
    >
      <div className={`flex items-center gap-2 md:gap-1 flex-nowrap min-h-0 ${isMissing ? 'px-0 py-0' : 'px-3 md:px-1.5 py-2 md:py-1'}`}>
        <span
          className={`inline-flex shrink-0 rounded px-2 md:px-1 py-0.5 text-xs md:text-[10px] font-bold ${styles.badge}`}
          title={getRarityLabel(card.rarity)}
        >
          {card.rarity}
        </span>
        <span className="text-stone-100 text-sm md:text-xs font-medium leading-snug break-words flex-1 min-w-0">
          {card.name}
        </span>
        {isDuplicate && (
          <span
            className={`shrink-0 rounded px-2 md:px-1.5 py-0.5 text-xs md:text-[10px] font-bold ${tradeBadge}`}
          >
            TRADE ×{card.count - 1}
          </span>
        )}
        {isMissing && !editable && (
          <span
            className="text-rose-400 text-lg md:text-sm shrink-0"
            title="Missing"
          >
            ❌
          </span>
        )}
        {editable && (
          <div className="shrink-0 flex items-center gap-0.5">
            <input
              type="number"
              min={0}
              max={99}
              value={card.count}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                if (!Number.isNaN(n) && n >= 0) onCountChange?.(n);
              }}
              className="w-12 md:w-9 h-10 md:h-9 rounded-lg md:rounded border border-stone-500/50 bg-stone-900 text-stone-100 text-base md:text-xs text-center touch-manipulation"
              aria-label={`Count for ${card.name}`}
            />
          </div>
        )}
      </div>
      {isDuplicate && !editable && (
        <div
          className={`px-3 md:px-1.5 pb-2 md:pb-1 text-xs md:text-[10px] font-bold ${colorTheme === 'cool' ? 'text-indigo-300' : colorTheme === 'forest' ? 'text-teal-300' : 'text-amber-400'}`}
        >
          ×{card.count - 1}
        </div>
      )}
    </div>
  );
}
