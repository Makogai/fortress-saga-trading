import type { ParseResult } from '../parser/parseCards';
import type { ThemeClasses } from '../lib/themes';

interface StatsDashboardProps {
  data: ParseResult;
  themeClasses: ThemeClasses;
  undoCount?: number;
  onUndo?: () => void;
}

export function StatsDashboard({ data, themeClasses, undoCount = 0, onUndo }: StatsDashboardProps) {
  const t = themeClasses;
  let owned = 0;
  let missing = 0;
  let duplicates = 0;
  let totalCards = 0;
  for (const album of data.albums) {
    for (const card of album.cards) {
      totalCards += 1;
      if (card.count >= 1) owned += 1;
      if (card.status === 'missing') missing += 1;
      if (card.status === 'duplicate') duplicates += 1;
    }
  }
  const toTrade = data.tradeList.reduce((s, e) => s + e.count, 0);
  const needCount = data.needList.length;
  const pct = totalCards > 0 ? Math.round((owned / totalCards) * 100) : 0;

  return (
    <div className={`flex flex-wrap items-center gap-4 py-3 px-4 rounded-2xl border shadow-sm backdrop-blur-sm ${t.border} ${t.surfaceAlt}`}>
      <span className={`text-sm font-medium ${t.textMuted}`}>Stats</span>
      <span className={t.text}>
        <strong>{owned}</strong> owned
      </span>
      <span className={t.need}>
        <strong>{missing}</strong> missing
      </span>
      <span className={t.trade}>
        <strong>{duplicates}</strong> dupes
      </span>
      <span className={`text-sm ${t.textMuted}`}>
        <strong>{pct}%</strong> complete
      </span>
      {(toTrade > 0 || needCount > 0) && (
        <span className={`text-sm ${t.textMuted}`}>
          <span className={t.trade}>{toTrade} to trade</span>
          {' · '}
          <span className={t.need}>{needCount} needed</span>
        </span>
      )}
      {undoCount > 0 && onUndo && (
        <button
          type="button"
          onClick={onUndo}
          className={`ml-auto text-sm font-medium ${t.textMuted} hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500 rounded`}
          aria-label="Undo last change"
        >
          Undo
        </button>
      )}
    </div>
  );
}
