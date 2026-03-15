import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import type { ThemeClasses } from '../lib/themes';

interface ShareQrModalProps {
  shareUrl: string;
  onClose: () => void;
  themeClasses: ThemeClasses;
  primaryBtn: string;
}

export function ShareQrModal({ shareUrl, onClose, themeClasses, primaryBtn }: ShareQrModalProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const t = themeClasses;

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(shareUrl, { width: 256, margin: 2 }).then((url) => {
      if (!cancelled) setDataUrl(url);
    });
    return () => { cancelled = true; };
  }, [shareUrl]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-modal-title"
    >
      <div
        className={`rounded-2xl border overflow-hidden max-w-xs w-full shadow-2xl p-5 backdrop-blur-xl ${t.surface} ${t.border}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="qr-modal-title" className={`text-lg font-bold mb-4 ${t.text}`}>
          Scan to open share link
        </h2>
        <div className="flex justify-center bg-white p-4 rounded-xl mb-4 shadow-inner">
          {dataUrl ? (
            <img src={dataUrl} alt="QR code for share link" width={256} height={256} />
          ) : (
            <div className="w-64 h-64 flex items-center justify-center text-stone-400">Loading…</div>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className={`w-full rounded-xl px-4 py-2.5 font-medium ${primaryBtn}`}
        >
          Close
        </button>
      </div>
    </div>
  );
}
