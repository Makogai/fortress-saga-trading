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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-link-title"
    >
      <div
        className={`rounded-2xl border shadow-2xl backdrop-blur-xl w-full max-w-md overflow-hidden glass-panel-solid ${t.surface} ${t.border}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-white/10">
          <h2 id="import-link-title" className={`text-lg font-bold ${t.text}`}>
            Import from share link
          </h2>
          <p className={`text-sm mt-1 ${t.textMuted}`}>
            Paste a shared collection link to load its counts.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="p-5">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://... or ?s=..."
            className={`w-full rounded-xl border px-4 py-3 text-sm mb-3 transition-colors ${
              isDark ? 'bg-white/5 border-white/20 text-stone-100 placeholder-stone-500 focus:border-amber-500/50' : 'bg-black/5 border-stone-300 text-stone-800 placeholder-stone-400 focus:border-amber-500/50'
            }`}
            aria-label="Share link URL"
            autoFocus
          />
          {message && (
            <p className={`text-sm mb-3 ${message.type === 'error' ? 'text-red-400' : t.textMuted}`}>
              {message.text}
            </p>
          )}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className={`rounded-xl px-4 py-2.5 text-sm font-medium ${t.border} ${t.surfaceAlt} ${t.text} hover:opacity-90 transition-opacity`}
            >
              Cancel
            </button>
            <button type="submit" className={`rounded-xl px-4 py-2.5 text-sm font-medium shadow-sm ${primaryBtn}`}>
              Import
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
