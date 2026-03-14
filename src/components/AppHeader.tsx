import { useState, useRef, useEffect } from 'react';
import type { ColorTheme } from '../lib/themes';

type Theme = 'dark' | 'light';
type Route = 'tracker' | 'albums' | { page: 'album'; slug: string };

interface AppHeaderProps {
  isDark: boolean;
  setTheme: (t: Theme) => void;
  colorTheme: ColorTheme;
  setColorTheme: (c: ColorTheme) => void;
  primaryBtn: string;
  hasData: boolean;
  editable: boolean;
  setEditable: (e: boolean) => void;
  shareDone: boolean;
  isReadOnly?: boolean;
  onFormatGuide: () => void;
  onImportCounts: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFullImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
  onShare: () => void;
  onDownloadBackup?: () => void;
  onRestoreBackup?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  restoreBackupInputRef?: React.RefObject<HTMLInputElement>;
  importCountsInputRef: React.RefObject<HTMLInputElement>;
  fullImportInputRef: React.RefObject<HTMLInputElement>;
  titleClass: string;
  currentRoute: Route;
  onNavigateTracker: () => void;
  onNavigateAlbums: () => void;
}

const COLOR_THEMES: { value: ColorTheme; label: string }[] = [
  { value: 'warm', label: 'Warm' },
  { value: 'cool', label: 'Cool' },
  { value: 'forest', label: 'Forest' },
  { value: 'season', label: 'Season' },
];

export function AppHeader({
  isDark,
  setTheme,
  colorTheme,
  setColorTheme,
  primaryBtn,
  hasData,
  editable,
  setEditable,
  shareDone,
  isReadOnly = false,
  onFormatGuide,
  onImportCounts,
  onFullImport,
  onReset,
  onShare,
  onDownloadBackup,
  onRestoreBackup,
  restoreBackupInputRef,
  importCountsInputRef,
  fullImportInputRef,
  titleClass,
  currentRoute,
  onNavigateTracker,
  onNavigateAlbums,
}: AppHeaderProps) {
  const isTracker = currentRoute === 'tracker';
  const isAlbums = currentRoute === 'albums' || (typeof currentRoute === 'object' && currentRoute.page === 'album');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    const close = () => setMobileOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [mobileOpen]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const close = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [dropdownOpen]);

  const btnBase = `rounded-lg px-3 py-2 text-sm font-medium transition-colors touch-manipulation ${
    isDark ? 'bg-stone-700 text-stone-200 hover:bg-stone-600' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
  }`;

  const triggerImportCounts = () => importCountsInputRef.current?.click();
  const triggerFullImport = () => fullImportInputRef.current?.click();

  return (
    <>
      <input
        ref={importCountsInputRef}
        type="file"
        accept=".txt,text/plain"
        className="hidden"
        onChange={onImportCounts}
      />
      <input
        ref={fullImportInputRef}
        type="file"
        accept=".txt,text/plain"
        className="hidden"
        onChange={onFullImport}
      />

      <header
        className="border-b border-white/10 sticky top-0 z-20 backdrop-blur-xl backdrop-saturate-150"
        style={{
          backgroundColor: isDark ? 'rgba(28, 25, 23, 0.8)' : 'rgba(250, 250, 249, 0.8)',
        }}
      >
        <div className="container mx-auto px-4 py-3 sm:py-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <h1 className={`text-base sm:text-lg font-bold truncate ${titleClass}`}>
                Fortress Saga
                <span className="hidden sm:inline opacity-90"> — Card Tracker</span>
              </h1>
              <nav className="flex items-center gap-1 shrink-0" aria-label="Main">
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); onNavigateTracker(); }}
                  className={`rounded-md px-2 py-1 text-xs font-medium ${
                    isTracker ? primaryBtn : isDark ? 'bg-stone-700/50 text-stone-400 hover:text-stone-200' : 'bg-stone-200/60 text-stone-500 hover:text-stone-700'
                  }`}
                >
                  Tracker
                </a>
                <a
                  href="#/albums"
                  onClick={(e) => { e.preventDefault(); onNavigateAlbums(); }}
                  className={`rounded-md px-2 py-1 text-xs font-medium ${
                    isAlbums ? primaryBtn : isDark ? 'bg-stone-700/50 text-stone-400 hover:text-stone-200' : 'bg-stone-200/60 text-stone-500 hover:text-stone-700'
                  }`}
                >
                  Albums
                </a>
              </nav>
            </div>

            {/* Desktop: right side */}
            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-stone-500 mr-1">Theme</span>
              {COLOR_THEMES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setColorTheme(value)}
                  className={`rounded-md px-2 py-1 text-xs font-medium ${
                    colorTheme === value ? primaryBtn : btnBase
                  }`}
                >
                  {label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className={btnBase}
                title={isDark ? 'Light mode' : 'Dark mode'}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? '☀️' : '🌙'}
              </button>

              <div className="w-px h-5 bg-stone-600" aria-hidden />

              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((o) => !o)}
                  className={btnBase}
                >
                  Menu ▼
                </button>
                {dropdownOpen && (
                  <div
                    className={`absolute right-0 top-full mt-1 py-1 min-w-[160px] rounded-lg border shadow-lg ${
                      isDark ? 'bg-stone-800 border-stone-600' : 'bg-white border-stone-200'
                    }`}
                  >
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm hover:bg-stone-700/50"
                      onClick={() => { onFormatGuide(); setDropdownOpen(false); }}
                    >
                      Format guide
                    </button>
                    {!isReadOnly && (
                      <>
                        <button
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-stone-700/50"
                          onClick={() => { triggerImportCounts(); setDropdownOpen(false); }}
                        >
                          Import counts
                        </button>
                        <button
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-stone-700/50"
                          onClick={() => { triggerFullImport(); setDropdownOpen(false); }}
                        >
                          Full import
                        </button>
                        {hasData && onDownloadBackup && (
                          <button
                            type="button"
                            className="w-full text-left px-3 py-2 text-sm hover:bg-stone-700/50"
                            onClick={() => { onDownloadBackup(); setDropdownOpen(false); }}
                          >
                            Download backup
                          </button>
                        )}
                        {onRestoreBackup && restoreBackupInputRef && (
                          <button
                            type="button"
                            className="w-full text-left px-3 py-2 text-sm hover:bg-stone-700/50"
                            onClick={() => { restoreBackupInputRef.current?.click(); setDropdownOpen(false); }}
                          >
                            Restore backup
                          </button>
                        )}
                        {hasData && (
                          <button
                            type="button"
                            className="w-full text-left px-3 py-2 text-sm hover:bg-stone-700/50 text-red-400"
                            onClick={() => { onReset(); setDropdownOpen(false); }}
                          >
                            Reset
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {hasData && (
                <>
                  <button
                    type="button"
                    onClick={onShare}
                    className={`rounded-lg px-3 py-2 text-sm font-medium ${primaryBtn}`}
                  >
                    {shareDone ? 'Copied!' : 'Share'}
                  </button>
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => setEditable(!editable)}
                      className={editable ? `rounded-lg px-3 py-2 text-sm font-medium ${primaryBtn}` : btnBase}
                    >
                      {editable ? 'Done' : 'Edit counts'}
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Mobile: hamburger */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setMobileOpen((o) => !o); }}
              className={`md:hidden rounded-xl p-3 min-h-[44px] min-w-[44px] flex items-center justify-center ${btnBase}`}
              aria-label="Menu"
            >
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>

          {/* Mobile menu panel */}
          {mobileOpen && (
            <div
              className={`md:hidden mt-4 pt-4 pb-1 border-t ${isDark ? 'border-stone-700' : 'border-stone-200'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-sm font-medium text-stone-500 px-1 mb-3">Theme</p>
              <div className="flex flex-wrap gap-2">
                {COLOR_THEMES.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setColorTheme(value)}
                    className={`rounded-xl px-4 py-3 text-sm min-h-[48px] ${colorTheme === value ? primaryBtn : btnBase}`}
                  >
                    {label}
                  </button>
                ))}
                <button type="button" onClick={() => setTheme(isDark ? 'light' : 'dark')} className={`rounded-xl px-4 py-3 text-sm min-h-[48px] ${btnBase}`} aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
                  {isDark ? '☀️ Light' : '🌙 Dark'}
                </button>
              </div>
              <p className="text-sm font-medium text-stone-500 px-1 mt-5 mb-3">Data</p>
              <div className="flex flex-col gap-3">
                <button type="button" onClick={() => { onFormatGuide(); setMobileOpen(false); }} className={`${btnBase} w-full text-left py-3.5 px-4 rounded-xl min-h-[48px] text-sm`}>
                  Format guide
                </button>
                {!isReadOnly && (
                  <>
                    <button type="button" onClick={() => { triggerImportCounts(); setMobileOpen(false); }} className={`${btnBase} w-full text-left py-3.5 px-4 rounded-xl min-h-[48px] text-sm`}>
                      Import counts
                    </button>
                    <button type="button" onClick={() => { triggerFullImport(); setMobileOpen(false); }} className={`${btnBase} w-full text-left py-3.5 px-4 rounded-xl min-h-[48px] text-sm`}>
                      Full import
                    </button>
                    {hasData && onDownloadBackup && (
                      <button type="button" onClick={() => { onDownloadBackup(); setMobileOpen(false); }} className={`${btnBase} w-full text-left py-3.5 px-4 rounded-xl min-h-[48px] text-sm`}>
                        Download backup
                      </button>
                    )}
                    {onRestoreBackup && restoreBackupInputRef && (
                      <button type="button" onClick={() => { restoreBackupInputRef.current?.click(); setMobileOpen(false); }} className={`${btnBase} w-full text-left py-3.5 px-4 rounded-xl min-h-[48px] text-sm`}>
                        Restore backup
                      </button>
                    )}
                      {hasData && (
                      <button type="button" onClick={() => { onReset(); setMobileOpen(false); }} className={`${btnBase} w-full text-left py-3.5 px-4 rounded-xl min-h-[48px] text-sm text-red-400`}>
                        Reset
                      </button>
                    )}
                  </>
                )}
                {hasData && (
                  <>
                    <button type="button" onClick={() => { onShare(); setMobileOpen(false); }} className={`w-full py-3.5 px-4 rounded-xl min-h-[48px] text-sm font-medium ${primaryBtn}`}>
                      {shareDone ? 'Link copied!' : 'Share'}
                    </button>
                    {!isReadOnly && (
                      <button type="button" onClick={() => { setEditable(!editable); setMobileOpen(false); }} className={editable ? `w-full py-3.5 px-4 rounded-xl min-h-[48px] text-sm font-medium ${primaryBtn}` : `${btnBase} w-full text-left py-3.5 px-4 rounded-xl min-h-[48px] text-sm`}>
                        {editable ? 'Done editing' : 'Edit counts'}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
