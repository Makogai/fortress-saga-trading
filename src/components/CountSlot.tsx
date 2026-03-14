import type { ParsedCard } from '../parser/parseCards';

interface CountSlotProps {
  card: ParsedCard | undefined;
  slotIndex: number;
  isDark?: boolean;
}

/** Single slot in counts-only view: shows 0 | 1 | ×2 etc in game layout. */
export function CountSlot({ card, isDark = true }: CountSlotProps) {
  if (!card) {
    return (
      <div
        className={`rounded-xl border flex items-center justify-center min-h-[3.5rem] md:min-h-[2.75rem] py-3 px-4 md:py-2 md:px-3 text-stone-500 text-base md:text-xs ${
          isDark ? 'border-stone-600/40 bg-stone-800/40' : 'border-stone-300 bg-stone-200/60'
        }`}
      >
        —
      </div>
    );
  }

  const isMissing = card.status === 'missing';
  const isDuplicate = card.status === 'duplicate';

  const label =
    card.count === 0 ? '0' : card.count === 1 ? '1' : `×${card.count}`;

  const slotClass = isMissing
    ? isDark
      ? 'border-red-500/60 bg-red-950/30 text-red-400'
      : 'border-red-400/60 bg-red-50 text-red-600'
    : isDuplicate
      ? isDark
        ? 'border-amber-400/60 bg-amber-950/25 text-amber-400'
        : 'border-amber-400/60 bg-amber-50 text-amber-700'
      : isDark
        ? 'border-stone-500/40 bg-stone-800/50 text-stone-200'
        : 'border-stone-400 bg-stone-100 text-stone-800';

  return (
    <div
      className={`rounded-xl border flex items-center justify-center min-h-[3.5rem] md:min-h-[2.75rem] py-3 px-4 md:py-2 md:px-3 text-base md:text-xs font-bold ${slotClass}`}
      title={card.name}
    >
      {label}
    </div>
  );
}
