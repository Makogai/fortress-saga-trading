import { useState, useEffect } from 'react';
import type { ThemeClasses } from '../lib/themes';

interface ImportLinkModalProps {
  onClose: () => void;
  onImport: (url: string) => { success: boolean; message?: string };
  isDark: boolean;
  themeClasses: ThemeClasses;
  primaryBtn: string;
}

export function ImportLinkModal({ onClose, onImport, isDark, themeClasses, primaryBtn }: ImportLinkModalProps) {
  const [url, setUrl] = useState('');
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const t = themeClasses;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const result = onImport(url.trim());
    if (result.success) {
      onClose();
    } else {
      setMessage({ type: 'error', text: result.message ?? 'Invalid link' });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 "
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-link-title"
    >
      <div
        className={`rounded-2xl border-2 shadow-xl backdrop-blur-xl backdrop-saturate-150 w-full max-w-md overflow-hidden ${t.surface} ${t.border}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-stone-600/40">
          <h2 id="import-link-title" className={`text-lg font-bold ${t.text}`}>
            Import from share link
          </h2>
          <p className={`text-sm mt-1 ${t.textMuted}`}>
            Paste a shared collection link to load its counts.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="p-4">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://... #s=..."
            className={`w-full rounded-lg border px-3 py-2.5 text-sm mb-3 ${
              isDark ? 'bg-stone-800 border-stone-600 text-stone-100 placeholder-stone-500' : 'bg-white border-stone-300 text-stone-800 placeholder-stone-400'
            }`}
            aria-label="Share link URL"
            autoFocus
          />
          {message && (
            <p className={`text-sm mb-3 ${message.type === 'error' ? 'text-red-400' : t.textMuted}`}>
              {message.text}
            </p>
          )}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${t.border} ${t.surfaceAlt} ${t.text}`}
            >
              Cancel
            </button>
            <button type="submit" className={`rounded-lg px-4 py-2 text-sm font-medium ${primaryBtn}`}>
              Import
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
