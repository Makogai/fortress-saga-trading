import { CATALOG } from '../data/catalog';

interface FormatGuideProps {
  onClose: () => void;
  isDark: boolean;
}

export function FormatGuide({ onClose, isDark }: FormatGuideProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="format-guide-title"
    >
      <div
        className={`relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border p-5 shadow-xl ${
          isDark ? 'bg-stone-900 border-stone-600 text-stone-200' : 'bg-white border-stone-300 text-stone-800'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="format-guide-title" className="text-lg font-bold">
            Import format guide
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1.5 hover:bg-stone-700 text-stone-400 hover:text-stone-200"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <p className="text-sm mb-3 opacity-90">
          Use a <strong>counts-only</strong> file to fill all cards at once. No card names — just numbers in a fixed order.
        </p>

        <h3 className="text-sm font-semibold mt-4 mb-1">Rules</h3>
        <ul className="text-sm list-disc list-inside space-y-1 opacity-90 mb-4">
          <li>One line per album (see order below).</li>
          <li>Each line: exactly 10 comma-separated numbers (no spaces required).</li>
          <li>Numbers are counts: 0 = missing, 1 = owned, 2+ = duplicate.</li>
          <li>Card order on each line = <strong>game page order</strong>: page 1 first (2 cards top, 3 bottom), then page 2 (2 top, 3 bottom). So positions 1–5 = first page, 6–10 = second page.</li>
        </ul>

        <h3 className="text-sm font-semibold mt-4 mb-1">Album order (use this order in your file)</h3>
        <ol className="text-sm space-y-0.5 mb-4 font-medium">
          {CATALOG.map((a, i) => (
            <li key={a.title}>
              {i + 1}. {a.title}
            </li>
          ))}
        </ol>

        <h3 className="text-sm font-semibold mt-4 mb-1">Example file</h3>
        <pre
          className={`text-xs rounded-lg p-3 overflow-x-auto ${
            isDark ? 'bg-stone-800 text-stone-300' : 'bg-stone-100 text-stone-700'
          }`}
        >
          {[
            '1,1,1,0,1,0,1,1,1,0',
            '1,1,1,2,1,2,2,1,1,1',
            '0,0,0,0,0,0,0,0,0,0',
            '0,0,0,0,0,0,0,0,0,0',
            '0,0,0,0,0,0,0,0,0,0',
            '0,0,0,0,0,0,0,0,0,0',
            '0,0,0,0,0,0,0,0,0,0',
            '0,0,0,0,0,0,0,0,0,0',
          ].join('\n')}
        </pre>
        <p className="text-xs mt-2 opacity-75">
          Line 1 = Equipment Album (10 counts). Line 2 = Monster Album. … Line 8 = Fortress Album II.
        </p>

        <div className="mt-5 pt-4 border-t border-stone-600">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-stone-600 px-4 py-2 text-sm font-medium hover:bg-stone-500"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
