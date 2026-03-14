interface WelcomeModalProps {
  onClose: () => void;
  isDark: boolean;
  onOpenFormatGuide: () => void;
}

const WELCOME_KEY = 'fortress-saga-welcome-seen';

export function getWelcomeSeen(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return localStorage.getItem(WELCOME_KEY) === '1';
  } catch {
    return true;
  }
}

export function setWelcomeSeen(): void {
  try {
    localStorage.setItem(WELCOME_KEY, '1');
  } catch {
    // ignore
  }
}

export function WelcomeModal({ onClose, isDark, onOpenFormatGuide }: WelcomeModalProps) {
  const handleGotIt = () => {
    setWelcomeSeen();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
    >
      <div
        className={`relative max-w-md w-full rounded-2xl border p-6 shadow-xl ${
          isDark ? 'bg-stone-900 border-stone-600 text-stone-200' : 'bg-white border-stone-200 text-stone-800'
        }`}
      >
        <h2 id="welcome-title" className="text-xl font-bold mb-2">
          Welcome to Fortress Saga Card Tracker
        </h2>
        <p className="text-sm opacity-90 mb-4">
          To get started, add your card counts in one of two ways:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-sm mb-5">
          <li>
            <strong>Enter manually</strong> — Click <strong>Edit counts</strong> in the menu, then type how many you have for each card (0 = missing, 1 = owned, 2+ = duplicate).
          </li>
          <li>
            <strong>Import a file</strong> — Use <strong>Import counts</strong> with a text file of numbers (one line per album, 10 numbers per line). See the <button type="button" onClick={() => { handleGotIt(); onOpenFormatGuide(); }} className="underline font-medium text-sky-400 hover:text-sky-300">Format guide</button> for the exact format.
          </li>
        </ol>
        <p className="text-xs opacity-75 mb-4">
          Your data is saved in this browser. Use <strong>Share</strong> to copy a link and post your collection elsewhere.
        </p>
        <button
          type="button"
          onClick={handleGotIt}
          className="w-full rounded-xl bg-sky-600 py-3 text-sm font-semibold text-white hover:bg-sky-500 transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
