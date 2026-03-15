import type { ParseResult } from '../parser/parseCards';
import type { ThemeClasses } from '../lib/themes';

interface GoalsPanelProps {
  data: ParseResult;
  themeClasses: ThemeClasses;
  goals: string[];
  onAddGoal: (albumTitle: string) => void;
  onRemoveGoal: (albumTitle: string) => void;
}

export function GoalsPanel({ data, themeClasses, goals, onAddGoal, onRemoveGoal }: GoalsPanelProps) {
  const t = themeClasses;
  const albumTitles = data.albums.map((a) => a.title);
  const progress = (albumTitle: string) => {
    const album = data.albums.find((a) => a.title === albumTitle);
    if (!album) return { owned: 0, total: 0 };
    const owned = album.cards.filter((c) => c.count >= 1).length;
    return { owned, total: album.cards.length };
  };

  const isCompleted = (albumTitle: string) => {
    const { owned, total } = progress(albumTitle);
    return total > 0 && owned >= total;
  };

  const albumTitlesAvailableForGoal = albumTitles.filter(
    (title) => !goals.includes(title) && !isCompleted(title)
  );

  return (
    <div className={`rounded-2xl border p-5 shadow-sm backdrop-blur-sm ${t.border} ${t.surfaceAlt}`}>
      <div className={`text-sm font-semibold ${t.textMuted} mb-3`}>Goals</div>
      {goals.length === 0 ? (
        <p className={`text-sm ${t.textMuted}`}>No goals yet. Add an album to focus on.</p>
      ) : (
        <ul className="space-y-2">
          {goals.map((title) => {
            const { owned, total } = progress(title);
            const missing = total - owned;
            const almost = total > 0 && missing >= 1 && missing <= 2;
            return (
              <li
                key={title}
                className={`flex items-center justify-between gap-2 text-sm ${t.text}`}
              >
                <span>
                  Complete {title}
                  {almost && (
                    <span
                      className={`ml-2 text-xs font-medium px-1.5 py-0.5 rounded ${t.need} ${t.needBg}`}
                      aria-label={`${missing} card(s) left`}
                    >
                      {missing} left
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveGoal(title)}
                  className={`text-xs ${t.textMuted} hover:underline focus:outline-none focus:ring-2 focus:ring-offset-1 rounded`}
                  aria-label={`Remove goal: ${title}`}
                >
                  Remove
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {albumTitlesAvailableForGoal.length > 0 && (
        <div className="mt-4 pt-4 border-t border-inherit opacity-80">
          <label htmlFor="goals-add" className={`text-xs font-medium ${t.textMuted} block mb-2`}>
            Add goal
          </label>
          <select
            id="goals-add"
            className={`w-full max-w-xs rounded-xl border px-3 py-2 text-sm font-medium ${t.border} ${t.surface} ${t.text}`}
            value=""
            onChange={(e) => {
              const v = e.target.value;
              if (v) {
                onAddGoal(v);
                e.target.value = '';
              }
            }}
            aria-label="Add goal album"
          >
            <option value="">Choose album…</option>
            {albumTitlesAvailableForGoal.map((title) => (
              <option key={title} value={title}>
                {title}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
