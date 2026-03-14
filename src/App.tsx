import { useRef, useState, useCallback, useEffect } from 'react';
import { toPng } from 'html-to-image';
import {
  parseCardsText,
  resultFromAlbums,
  setCardCount,
  type ParseResult,
} from './parser/parseCards';
import { defaultCounts, catalogToAlbums, CATALOG } from './data/catalog';
import { titleToSlug } from './lib/albumSlug';
import { loadFromStorage, saveToStorage } from './lib/storage';
import { loadGoals, saveGoals } from './lib/goalsStorage';
import { loadFavorites, saveFavorites } from './lib/favoritesStorage';
import { buildBackup, downloadBackup, parseBackupFile } from './lib/backup';
import { buildTextExport } from './lib/textExport';
import { parseCountsOnly, applyCounts } from './lib/importCounts';
import { buildShareUrl, decodeState, stateToResult } from './lib/shareLink';
import type { RarityFilter } from './lib/filterCards';
import {
  getThemeClasses,
  getPrimaryButtonClasses,
  type ColorTheme,
} from './lib/themes';
import { AlbumGrid, type ViewMode } from './components/AlbumGrid';
import { StatsDashboard } from './components/StatsDashboard';
import { GoalsPanel } from './components/GoalsPanel';
import { TradingSummary } from './components/TradingSummary';
import { TradingOnlyPanel } from './components/TradingOnlyPanel';
import { FormatGuide } from './components/FormatGuide';
import { ShareQrModal } from './components/ShareQrModal';
import { WelcomeModal, getWelcomeSeen } from './components/WelcomeModal';
import { AppHeader } from './components/AppHeader';
import { AlbumsShelf } from './pages/AlbumsShelf';
import { AlbumDetail } from './pages/AlbumDetail';
import './styles.css';

type Route = 'tracker' | 'albums' | { page: 'album'; slug: string };

function parseHash(): Route {
  const h = typeof window !== 'undefined' ? window.location.hash.slice(1) : '';
  if (h === '/albums') return 'albums';
  const albumMatch = /^\/album\/([^/]+)$/.exec(h);
  if (albumMatch) return { page: 'album', slug: albumMatch[1] };
  return 'tracker';
}

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
  const [route, setRoute] = useState<Route>(() => parseHash());
  const [data, setData] = useState<ParseResult | null>(() => getCleanSlate());
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [theme, setTheme] = useState<Theme>('dark');
  const [colorTheme, setColorTheme] = useState<ColorTheme>('cool');
  const [viewMode, setViewMode] = useState<ViewMode>('full');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('trading');
  const [exportScale, setExportScale] = useState<1 | 2>(2);
  const [exportSectionInView, setExportSectionInView] = useState(true);
  const exportSectionRef = useRef<HTMLElement>(null);
  const [editable, setEditable] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>('');
  const [savedToast, setSavedToast] = useState(false);
  const [copyDone, setCopyDone] = useState(false);
  const [shareDone, setShareDone] = useState(false);
  const [showFormatGuide, setShowFormatGuide] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [undoHistory, setUndoHistory] = useState<ParseResult[]>([]);
  const [goals, setGoals] = useState<string[]>(() => loadGoals());
  const [favorites, setFavorites] = useState<string[]>(() => loadFavorites());
  const fullCaptureRef = useRef<HTMLDivElement>(null);
  const tradingCaptureRef = useRef<HTMLDivElement>(null);
  const importCountsInputRef = useRef<HTMLInputElement>(null);
  const fullImportInputRef = useRef<HTMLInputElement>(null);
  const restoreBackupInputRef = useRef<HTMLInputElement>(null);

  // Sticky export bar: show when export section is not in view
  useEffect(() => {
    if (!data || !exportSectionRef.current) return;
    const el = exportSectionRef.current;
    const io = new IntersectionObserver(
      ([entry]) => setExportSectionInView(entry.isIntersecting),
      { threshold: 0.1, rootMargin: '0px 0px -80px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [data]);

  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Keyboard shortcuts: E = edit, Esc = close modals, 1–4 = view mode
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const inInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      if (e.key === 'Escape') {
        if (showFormatGuide) setShowFormatGuide(false);
        else if (showWelcome) setShowWelcome(false);
        return;
      }
      if (inInput) return;
      if (e.key === 'e' || e.key === 'E') {
        if (route === 'tracker' && data && !isReadOnly) setEditable((prev) => !prev);
        return;
      }
      if (route === 'tracker' && data && e.key >= '1' && e.key <= '4') {
        const idx = parseInt(e.key, 10) - 1;
        if (VIEW_MODES[idx]) setViewMode(VIEW_MODES[idx].value);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [route, data, isReadOnly, showFormatGuide, showWelcome]);

  const showSaved = useCallback(() => {
    setSavedToast(true);
  }, []);

  useEffect(() => {
    if (!savedToast) return;
    const id = setTimeout(() => setSavedToast(false), 2000);
    return () => clearTimeout(id);
  }, [savedToast]);

  const processText = useCallback((text: string, onSuccess?: () => void) => {
    setError(null);
    try {
      const result = parseCardsText(text);
      if (result.albums.length === 0) {
        setError('No albums found. Check the file format.');
        setData(null);
        setUndoHistory([]);
      } else {
        setData(result);
        setUndoHistory([]);
        saveToStorage({ albums: result.albums });
        onSuccess?.();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse cards.');
      setData(null);
      setUndoHistory([]);
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
          setUndoHistory([]);
          saveToStorage({ albums: result.albums });
          showSaved();
        } else {
          setError(parsed.message);
        }
      };
      reader.onerror = () => setError('Failed to read file');
      reader.readAsText(file);
      e.target.value = '';
    },
    [showSaved]
  );

  const handleFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const text = String(reader.result ?? '');
        processText(text, showSaved);
      };
      reader.onerror = () => setError('Failed to read file');
      reader.readAsText(file);
      e.target.value = '';
    },
    [processText, showSaved]
  );

  const handleResetToCleanSlate = useCallback(() => {
    setData(getCleanSlate());
    setUndoHistory([]);
    saveToStorage({ albums: getCleanSlate().albums });
    setError(null);
    showSaved();
  }, [showSaved]);

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

  const handleShare = useCallback(() => {
    if (!data) return;
    const url = buildShareUrl(data);
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator
        .share({
          title: 'Fortress Saga collection',
          text: 'My card collection progress',
          url,
        })
        .then(() => {
          setShareDone(true);
          setTimeout(() => setShareDone(false), 2500);
        })
        .catch(() => {
          handleCopyShareLink();
        });
    } else {
      handleCopyShareLink();
    }
  }, [data, handleCopyShareLink]);

  const handleCountChange = useCallback(
    (albumTitle: string, cardIndex: number, count: number) => {
      if (!data) return;
      const next = setCardCount(data, albumTitle, cardIndex, count);
      setUndoHistory((prev) => [JSON.parse(JSON.stringify(data)), ...prev].slice(0, 10));
      setData(next);
      saveToStorage({ albums: next.albums });
      showSaved();
    },
    [data, showSaved]
  );

  const handleUndo = useCallback(() => {
    if (undoHistory.length === 0) return;
    const prev = undoHistory[0];
    setUndoHistory((h) => h.slice(1));
    setData(prev);
    saveToStorage({ albums: prev.albums });
    showSaved();
  }, [undoHistory, showSaved]);

  const handleAddGoal = useCallback((albumTitle: string) => {
    setGoals((prev) => {
      if (prev.includes(albumTitle)) return prev;
      const next = [...prev, albumTitle];
      saveGoals(next);
      return next;
    });
  }, []);

  const handleRemoveGoal = useCallback((albumTitle: string) => {
    setGoals((prev) => {
      const next = prev.filter((t) => t !== albumTitle);
      saveGoals(next);
      return next;
    });
  }, []);

  const handleToggleFavorite = useCallback((slug: string) => {
    setFavorites((prev) => {
      const next = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug];
      saveFavorites(next);
      return next;
    });
  }, []);

  const handleDownloadBackup = useCallback(() => {
    if (!data) return;
    const backup = buildBackup(data.albums);
    downloadBackup(backup);
  }, [data]);

  const handleRestoreBackup = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const text = String(reader.result ?? '');
        setError(null);
        const result = parseBackupFile(text);
        if (result.success) {
          const restored = resultFromAlbums(result.data.albums);
          setData(restored);
          setUndoHistory([]);
          saveToStorage({ albums: restored.albums });
          setGoals(result.data.goals);
          saveGoals(result.data.goals);
          setFavorites(result.data.favorites);
          saveFavorites(result.data.favorites);
          showSaved();
        } else {
          setError(result.message);
        }
      };
      reader.onerror = () => setError('Failed to read file');
      reader.readAsText(file);
      e.target.value = '';
    },
    [showSaved]
  );

  const handleExportPng = useCallback(async () => {
    const ref =
      exportFormat === 'trading' ? tradingCaptureRef.current : fullCaptureRef.current;
    if (!ref) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(ref, {
        pixelRatio: exportScale,
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
  }, [theme, exportFormat, exportScale]);

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
  const albumSlug = route !== 'tracker' && route !== 'albums' ? route.slug : null;
  const albumCatalogIndex =
    albumSlug != null
      ? CATALOG.findIndex((a) => titleToSlug(a.title) === albumSlug)
      : -1;
  const albumData =
    albumCatalogIndex >= 0 && data ? data.albums[albumCatalogIndex] ?? null : null;

  const openAlbum = useCallback((slug: string) => {
    window.location.hash = `#/album/${slug}`;
  }, []);
  const goToAlbums = useCallback(() => {
    window.location.hash = '#/albums';
  }, []);
  const goToTracker = useCallback(() => {
    window.location.hash = '#';
  }, []);

  // Hidden file input for restore backup (in App so ref is stable and onChange fires)
  const restoreBackupInput = (
    <input
      ref={restoreBackupInputRef}
      type="file"
      accept=".json,application/json"
      className="hidden"
      onChange={handleRestoreBackup}
      aria-hidden
    />
  );

  // Albums shelf page
  if (route === 'albums') {
    return (
      <>
        {restoreBackupInput}
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
        onShare={handleShare}
        onDownloadBackup={handleDownloadBackup}
        onRestoreBackup={handleRestoreBackup}
        restoreBackupInputRef={restoreBackupInputRef}
        importCountsInputRef={importCountsInputRef}
        fullImportInputRef={fullImportInputRef}
        titleClass={themeClasses.primary}
        currentRoute={route}
        onNavigateTracker={goToTracker}
        onNavigateAlbums={goToAlbums}
      />
        <AlbumsShelf
          data={data}
          onOpenAlbum={openAlbum}
          onNavigateTracker={goToTracker}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          isDark={isDark}
          themeClasses={themeClasses}
        />
        {savedToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-lg px-4 py-2 text-sm font-medium bg-stone-800 text-stone-100 shadow-lg border border-stone-600" role="status" aria-live="polite">
            Saved
          </div>
        )}
      </>
    );
  }

  // Single album detail page
  if (albumSlug) {
    return (
      <>
        {restoreBackupInput}
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
        onShare={handleShare}
        onDownloadBackup={handleDownloadBackup}
        onRestoreBackup={handleRestoreBackup}
        restoreBackupInputRef={restoreBackupInputRef}
        importCountsInputRef={importCountsInputRef}
        fullImportInputRef={fullImportInputRef}
        titleClass={themeClasses.primary}
        currentRoute={route}
        onNavigateTracker={goToTracker}
        onNavigateAlbums={goToAlbums}
        />
        <AlbumDetail
          slug={albumSlug}
          albumData={albumData}
          onBack={goToAlbums}
          onPrev={albumCatalogIndex > 0 ? () => openAlbum(titleToSlug(CATALOG[albumCatalogIndex - 1].title)) : undefined}
          onNext={albumCatalogIndex >= 0 && albumCatalogIndex < CATALOG.length - 1 ? () => openAlbum(titleToSlug(CATALOG[albumCatalogIndex + 1].title)) : undefined}
          isFavorite={favorites.includes(albumSlug)}
          onToggleFavorite={() => handleToggleFavorite(albumSlug)}
          isDark={isDark}
          themeClasses={themeClasses}
          primaryBtn={primaryBtn}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          rarityFilter={rarityFilter}
          setRarityFilter={setRarityFilter}
        />
        {savedToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-lg px-4 py-2 text-sm font-medium bg-stone-800 text-stone-100 shadow-lg border border-stone-600" role="status" aria-live="polite">
            Saved
          </div>
        )}
      </>
    );
  }

  // Tracker page
  return (
    <div
      className={`min-h-screen transition-colors ${
        isDark ? 'bg-stone-950 text-stone-200' : 'bg-stone-100 text-stone-800'
      }`}
    >
      {restoreBackupInput}
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
        onShare={handleShare}
        onDownloadBackup={handleDownloadBackup}
        onRestoreBackup={handleRestoreBackup}
        restoreBackupInputRef={restoreBackupInputRef}
        importCountsInputRef={importCountsInputRef}
        fullImportInputRef={fullImportInputRef}
        titleClass={themeClasses.primary}
        currentRoute="tracker"
        onNavigateTracker={goToTracker}
        onNavigateAlbums={goToAlbums}
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
            <div className="mb-4 space-y-4">
              <StatsDashboard
                data={data}
                themeClasses={themeClasses}
                undoCount={undoHistory.length}
                onUndo={handleUndo}
              />
              <GoalsPanel
                data={data}
                themeClasses={themeClasses}
                goals={goals}
                onAddGoal={handleAddGoal}
                onRemoveGoal={handleRemoveGoal}
              />
            </div>
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
                <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-center">
                  <label className="flex items-center gap-2 min-w-0">
                    <span className={`text-sm font-medium shrink-0 ${themeClasses.textMuted}`}>Search</span>
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Card name…"
                      className={`flex-1 min-w-0 rounded-lg border px-3 py-2 text-sm ${
                        isDark ? 'bg-stone-800 border-stone-600 text-stone-100 placeholder-stone-500' : 'bg-white border-stone-300 text-stone-800 placeholder-stone-400'
                      }`}
                      aria-label="Filter by card name"
                    />
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-sm font-medium ${themeClasses.textMuted}`}>Rarity</span>
                    {(['', 'U', 'R', 'E', 'L'] as const).map((r) => (
                      <button
                        key={r || 'all'}
                        type="button"
                        onClick={() => setRarityFilter(r)}
                        className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                          rarityFilter === r ? primaryBtn : isDark ? 'bg-stone-700 text-stone-400 hover:bg-stone-600' : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                        }`}
                        aria-pressed={rarityFilter === r}
                        aria-label={r ? `Filter by ${r}` : 'All rarities'}
                      >
                        {r || 'All'}
                      </button>
                    ))}
                  </div>
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
                    isDark={isDark}
                    onCardCountChange={
                      !isReadOnly && editable
                        ? (cardIndex, count) =>
                            handleCountChange(album.title, cardIndex, count)
                        : undefined
                    }
                    searchQuery={searchQuery}
                    rarityFilter={rarityFilter}
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
              ref={exportSectionRef}
              className={`mt-7 md:mt-6 rounded-xl border p-5 md:p-4 ${themeClasses.border} ${themeClasses.surfaceAlt}`}
            >
              <h2 className={`text-base font-semibold ${themeClasses.textMuted} mb-4`}>
                Copy / export for Discord
              </h2>
              <div className={`rounded-xl border ${themeClasses.border} ${themeClasses.surfaceAlt} p-4 mb-4`}>
                <div className="mb-3">
                  <span className={`block text-sm ${themeClasses.textMuted} mb-2`}>Format</span>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        { value: 'trading' as const, label: 'Trading only' },
                        { value: 'text' as const, label: 'Text (copy)' },
                        { value: 'full' as const, label: 'Full image' },
                      ] as const
                    ).map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setExportFormat(value)}
                        className={`rounded-lg px-3 py-2 text-sm font-medium ${
                          exportFormat === value ? primaryBtn : isDark ? 'bg-stone-700 text-stone-300 hover:bg-stone-600' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                {(exportFormat === 'full' || exportFormat === 'trading') && (
                  <div>
                    <span className={`block text-sm ${themeClasses.textMuted} mb-2`}>Image size</span>
                    <div className="flex flex-wrap gap-2">
                      {([1, 2] as const).map((scale) => (
                        <button
                          key={scale}
                          type="button"
                          onClick={() => setExportScale(scale)}
                          className={`rounded-lg px-3 py-2 text-sm font-medium ${
                            exportScale === scale ? primaryBtn : isDark ? 'bg-stone-700 text-stone-300 hover:bg-stone-600' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                          }`}
                        >
                          {scale}×
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-3 pt-3 border-t border-stone-600/40">
                  <span className={`block text-sm ${themeClasses.textMuted} mb-2`}>Share link</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setShowQrModal(true)}
                      className={`rounded-lg px-3 py-2 text-sm font-medium ${isDark ? 'bg-stone-700 text-stone-300 hover:bg-stone-600' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'}`}
                    >
                      Show QR code
                    </button>
                  </div>
                </div>
              </div>
              {showQrModal && data && (
                <ShareQrModal
                  shareUrl={buildShareUrl(data)}
                  onClose={() => setShowQrModal(false)}
                  themeClasses={themeClasses}
                  primaryBtn={primaryBtn}
                />
              )}

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

            {/* Floating export bar (Apple-style blur) when section is out of view */}
            {data && !exportSectionInView && (
              <div
                className="fixed left-4 right-4 z-40 flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl max-w-md mx-auto backdrop-blur-xl backdrop-saturate-150 border border-white/20 shadow-sm export-float-bottom"
                style={{
                  backgroundColor: isDark ? 'rgba(28, 25, 23, 0.72)' : 'rgba(250, 250, 249, 0.72)',
                }}
                role="toolbar"
                aria-label="Quick export"
              >
                {(
                  [
                    { value: 'trading' as const, label: 'Trading', icon: '🟡' },
                    { value: 'text' as const, label: 'Text', icon: '📋' },
                    { value: 'full' as const, label: 'Full', icon: '🖼' },
                  ] as const
                ).map(({ value, label, icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setExportFormat(value)}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-opacity ${
                      exportFormat === value ? primaryBtn : isDark ? 'bg-white/10 text-stone-300 hover:bg-white/15' : 'bg-black/5 text-stone-600 hover:bg-black/10'
                    }`}
                    title={label}
                  >
                    <span aria-hidden>{icon}</span>
                    <span>{label}</span>
                  </button>
                ))}
                {(exportFormat === 'trading' || exportFormat === 'full') ? (
                  <button
                    type="button"
                    onClick={handleExportPng}
                    disabled={isExporting}
                    title="Download PNG"
                    aria-label={isExporting ? 'Generating…' : 'Download PNG'}
                    className={`rounded-xl p-2.5 text-lg leading-none ${primaryBtn} disabled:opacity-50`}
                  >
                    <span aria-hidden>{isExporting ? '…' : '📥'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCopyText}
                    title={copyDone ? 'Copied!' : 'Copy text'}
                    aria-label={copyDone ? 'Copied!' : 'Copy text'}
                    className={`rounded-xl p-2.5 text-lg leading-none ${primaryBtn}`}
                  >
                    <span aria-hidden>{copyDone ? '✓' : '📋'}</span>
                  </button>
                )}
              </div>
            )}
          </>
        )}
        {savedToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-lg px-4 py-2 text-sm font-medium bg-stone-800 text-stone-100 shadow-lg border border-stone-600" role="status" aria-live="polite">
            Saved
          </div>
        )}
      </main>
    </div>
  );
}
