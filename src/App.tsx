import { useRef, useState, useCallback, useEffect } from 'react';
import { toPng } from 'html-to-image';
import {
  parseCardsText,
  resultFromAlbums,
  setCardCount,
  type ParseResult,
} from './parser/parseCards';
import { defaultCounts, catalogToAlbums } from './data/catalog';
import { loadFromStorage, saveToStorage } from './lib/storage';
import { buildTextExport } from './lib/textExport';
import { parseCountsOnly, applyCounts } from './lib/importCounts';
import { buildShareUrl, decodeState, stateToResult } from './lib/shareLink';
import {
  getThemeClasses,
  getPrimaryButtonClasses,
  type ColorTheme,
} from './lib/themes';
import { AlbumGrid, type ViewMode } from './components/AlbumGrid';
import { TradingSummary } from './components/TradingSummary';
import { TradingOnlyPanel } from './components/TradingOnlyPanel';
import { FormatGuide } from './components/FormatGuide';
import { WelcomeModal, getWelcomeSeen } from './components/WelcomeModal';
import { AppHeader } from './components/AppHeader';
import './styles.css';

type Theme = 'dark' | 'light';
type ExportFormat = 'full' | 'trading' | 'text';

const VIEW_MODES: { value: ViewMode; label: string }[] = [
  { value: 'full', label: 'Full' },
  { value: 'needOnly', label: 'Need only' },
  { value: 'haveOnly', label: 'Have only' },
  { value: 'counts', label: 'Counts' },
];

/** Clean slate: catalog with all counts 0. */
function getCleanSlate(): ParseResult {
  return resultFromAlbums(catalogToAlbums(defaultCounts()));
}

export default function App() {
  const [data, setData] = useState<ParseResult | null>(() => getCleanSlate());
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [theme, setTheme] = useState<Theme>('dark');
  const [colorTheme, setColorTheme] = useState<ColorTheme>('cool');
  const [viewMode, setViewMode] = useState<ViewMode>('full');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('full');
  const [editable, setEditable] = useState(false);
  const [copyDone, setCopyDone] = useState(false);
  const [shareDone, setShareDone] = useState(false);
  const [showFormatGuide, setShowFormatGuide] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const fullCaptureRef = useRef<HTMLDivElement>(null);
  const tradingCaptureRef = useRef<HTMLDivElement>(null);
  const importCountsInputRef = useRef<HTMLInputElement>(null);
  const fullImportInputRef = useRef<HTMLInputElement>(null);

  const processText = useCallback((text: string) => {
    setError(null);
    try {
      const result = parseCardsText(text);
      if (result.albums.length === 0) {
        setError('No albums found. Check the file format.');
        setData(null);
      } else {
        setData(result);
        saveToStorage({ albums: result.albums });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse cards.');
      setData(null);
    }
  }, []);

  // Initial load: URL hash (share link) first, then storage, else keep clean slate; show welcome for new visitors
  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    const counts = decodeState(hash);
    if (counts) {
      const result = stateToResult(counts);
      setData(result);
      setIsReadOnly(true);
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      return;
    }
    const stored = loadFromStorage();
    if (stored?.albums?.length) {
      setData(resultFromAlbums(stored.albums));
    } else if (!getWelcomeSeen()) {
      setShowWelcome(true);
    }
  }, []);

  const handleImportCounts = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const text = String(reader.result ?? '');
        setError(null);
        const parsed = parseCountsOnly(text);
        if (parsed.success) {
          const result = applyCounts(parsed.counts);
          setData(result);
          saveToStorage({ albums: result.albums });
        } else {
          setError(parsed.message);
        }
      };
      reader.onerror = () => setError('Failed to read file');
      reader.readAsText(file);
      e.target.value = '';
    },
    []
  );

  const handleFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const text = String(reader.result ?? '');
        processText(text);
      };
      reader.onerror = () => setError('Failed to read file');
      reader.readAsText(file);
      e.target.value = '';
    },
    [processText]
  );

  const handleResetToCleanSlate = useCallback(() => {
    setData(getCleanSlate());
    saveToStorage({ albums: getCleanSlate().albums });
    setError(null);
  }, []);

  const handleCopyShareLink = useCallback(() => {
    if (!data) return;
    const url = buildShareUrl(data);
    navigator.clipboard.writeText(url).then(
      () => {
        setShareDone(true);
        setTimeout(() => setShareDone(false), 2500);
      },
      () => setError('Could not copy link')
    );
  }, [data]);

  const handleCountChange = useCallback(
    (albumTitle: string, cardIndex: number, count: number) => {
      if (!data) return;
      const next = setCardCount(data, albumTitle, cardIndex, count);
      setData(next);
      saveToStorage({ albums: next.albums });
    },
    [data]
  );

  const handleExportPng = useCallback(async () => {
    const ref =
      exportFormat === 'trading' ? tradingCaptureRef.current : fullCaptureRef.current;
    if (!ref) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(ref, {
        pixelRatio: 2,
        backgroundColor: theme === 'dark' ? '#1c1917' : '#fafaf9',
        cacheBust: true,
      });
      const link = document.createElement('a');
      link.download =
        exportFormat === 'trading'
          ? 'fortress-saga-trading.png'
          : 'fortress-saga-cards.png';
      link.href = dataUrl;
      link.click();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  }, [theme, exportFormat]);

  const handleCopyText = useCallback(() => {
    if (!data) return;
    const text = buildTextExport(data);
    navigator.clipboard.writeText(text).then(
      () => {
        setCopyDone(true);
        setTimeout(() => setCopyDone(false), 2000);
      },
      () => setError('Copy failed')
    );
  }, [data]);

  const isDark = theme === 'dark';
  const themeClasses = getThemeClasses(colorTheme, isDark);
  const primaryBtn = getPrimaryButtonClasses(colorTheme);

  return (
    <div
      className={`min-h-screen transition-colors ${
        isDark ? 'bg-stone-950 text-stone-200' : 'bg-stone-100 text-stone-800'
      }`}
    >
      <AppHeader
        isDark={isDark}
        setTheme={setTheme}
        colorTheme={colorTheme}
        setColorTheme={setColorTheme}
        primaryBtn={primaryBtn}
        hasData={!!data}
        editable={editable}
        setEditable={setEditable}
        shareDone={shareDone}
        isReadOnly={isReadOnly}
        onFormatGuide={() => setShowFormatGuide(true)}
        onImportCounts={handleImportCounts}
        onFullImport={handleFile}
        onReset={handleResetToCleanSlate}
        onShare={handleCopyShareLink}
        importCountsInputRef={importCountsInputRef}
        fullImportInputRef={fullImportInputRef}
        titleClass={themeClasses.primary}
      />

      {isReadOnly && (
        <div
          className={`border-b px-4 py-3 sm:py-2 text-center text-sm ${
            isDark ? 'bg-sky-950/40 border-sky-700/50 text-sky-200' : 'bg-sky-100 border-sky-200 text-sky-800'
          }`}
        >
          Viewing shared collection — read only. You can change view filters and export images or text.
        </div>
      )}

      {showWelcome && (
        <WelcomeModal
          onClose={() => setShowWelcome(false)}
          isDark={isDark}
          onOpenFormatGuide={() => setShowFormatGuide(true)}
        />
      )}

      {showFormatGuide && (
        <FormatGuide
          onClose={() => setShowFormatGuide(false)}
          isDark={isDark}
        />
      )}

      <main className="container mx-auto px-5 sm:px-5 py-6 sm:py-6 max-w-6xl pb-safe">
        {error && (
          <div
            className={`mb-3 rounded border px-3 py-2 text-sm ${
              isDark
                ? 'border-red-500/50 bg-red-950/20 text-red-300'
                : 'border-red-400 bg-red-50 text-red-800'
            }`}
          >
            {error}
          </div>
        )}

        {!data && (
          <div
            className={`rounded-lg border p-6 text-center max-w-md mx-auto ${
              isDark ? 'border-stone-600/50 bg-stone-900/40' : 'border-stone-300 bg-stone-200/60'
            }`}
          >
            <p className="text-stone-500 text-sm mb-3">
              Enter card counts in the grid (Edit counts) or use <strong>Import counts</strong> with a file in the format from the Format guide.
            </p>
            <button
              type="button"
              onClick={() => setData(getCleanSlate())}
              className={`rounded px-3 py-2 text-sm font-medium ${primaryBtn}`}
            >
              Start with clean slate
            </button>
          </div>
        )}

        {data && (
          <>
            <div
              ref={fullCaptureRef}
              className={`summary-capture rounded-xl border p-5 md:p-5 ${themeClasses.border} ${themeClasses.surface}`}
            >
              <div className={`mb-5 md:mb-4 pb-4 md:pb-3 border-b ${themeClasses.border}`}>
                <span className={`block text-sm font-medium ${themeClasses.textMuted} mb-3 md:mb-2`}>View</span>
                <div className="grid grid-cols-2 md:flex md:flex-wrap gap-3 md:gap-2">
                  {VIEW_MODES.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setViewMode(value)}
                      className={`rounded-xl md:rounded-lg px-4 py-3 md:px-2 md:py-1 text-sm font-medium transition-colors min-h-[48px] md:min-h-0 touch-manipulation ${
                        viewMode === value ? primaryBtn : isDark ? 'bg-stone-700 text-stone-300 hover:bg-stone-600' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-6 md:space-y-4">
                {data.albums.map((album) => (
                  <AlbumGrid
                    key={album.title}
                    album={album}
                    viewMode={viewMode}
                    editable={!isReadOnly && editable}
                    colorTheme={colorTheme}
                    onCardCountChange={
                      !isReadOnly && editable
                        ? (cardIndex, count) =>
                            handleCountChange(album.title, cardIndex, count)
                        : undefined
                    }
                  />
                ))}
              </div>
              <div className={`mt-7 md:mt-5 pt-6 md:pt-4 border-t ${themeClasses.border}`}>
                <TradingSummary
                  tradeList={data.tradeList}
                  needList={data.needList}
                  themeClasses={themeClasses}
                />
              </div>
            </div>

            <section
              className={`mt-7 md:mt-6 rounded-xl border p-5 md:p-4 ${themeClasses.border} ${themeClasses.surfaceAlt}`}
            >
              <h2 className={`text-base font-semibold ${themeClasses.textMuted} mb-4`}>
                Copy / export for Discord
              </h2>
              <div className="mb-4">
                <span className={`block text-sm ${themeClasses.textMuted} mb-3 md:mb-2`}>Format</span>
                <div className="flex flex-col md:flex-row md:flex-wrap gap-3 md:gap-2">
                  {(
                    [
                      { value: 'full' as const, label: 'Full image' },
                      { value: 'trading' as const, label: 'Trading only' },
                      { value: 'text' as const, label: 'Text (copy)' },
                    ] as const
                  ).map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setExportFormat(value)}
                      className={`rounded-xl md:rounded-lg px-4 py-3 md:px-2.5 md:py-1.5 text-sm font-medium transition-colors min-h-[48px] md:min-h-0 touch-manipulation w-full md:w-auto ${
                        exportFormat === value ? primaryBtn : isDark ? 'bg-stone-700 text-stone-300 hover:bg-stone-600' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {exportFormat === 'trading' && (
                <div ref={tradingCaptureRef} className="mb-5 sm:mb-4">
                  <TradingOnlyPanel
                    tradeList={data.tradeList}
                    needList={data.needList}
                    isDark={isDark}
                    themeClasses={themeClasses}
                  />
                </div>
              )}

              {exportFormat === 'trading' && (
                <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-2">
                  <button
                    type="button"
                    onClick={handleExportPng}
                    disabled={isExporting}
                    className={`w-full sm:w-auto rounded-xl px-4 py-3 sm:py-2 text-sm font-medium min-h-[48px] sm:min-h-0 touch-manipulation ${primaryBtn} disabled:opacity-50`}
                  >
                    {isExporting ? 'Generating…' : 'Download PNG'}
                  </button>
                </div>
              )}
              {exportFormat === 'full' && (
                <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-2">
                  <button
                    type="button"
                    onClick={handleExportPng}
                    disabled={isExporting}
                    className={`w-full sm:w-auto rounded-xl px-4 py-3 sm:py-2 text-sm font-medium min-h-[48px] sm:min-h-0 touch-manipulation ${primaryBtn} disabled:opacity-50`}
                  >
                    {isExporting ? 'Generating…' : 'Download PNG'}
                  </button>
                </div>
              )}
              {exportFormat === 'text' && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyText}
                    className={`w-full sm:w-auto rounded-xl px-4 py-3 sm:py-2 text-sm font-medium min-h-[48px] sm:min-h-0 touch-manipulation ${primaryBtn}`}
                  >
                    {copyDone ? 'Copied!' : 'Copy text'}
                  </button>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
