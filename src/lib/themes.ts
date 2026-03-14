/** Color theme: affects accents, trade/need/have colors. */
export type ColorTheme = 'warm' | 'cool' | 'forest' | 'season';

/** Forest of Order season palette. pageBg = darker background so content doesn’t pop off navbar. */
export const SEASON_COLORS = {
  albumCoverBg: '#975A31',
  coverBorder: '#D69858',
  iconAndBg: '#EAD7C2',
  openAlbumBg: '#EDCE99',
  pageBg: '#5c4a3a',       // darker brown for albums/detail page background
  pageBgShelf: '#6B5344',  // slightly lighter for shelf panels
} as const;

export interface ThemeClasses {
  /** Primary accent (headers, buttons, album titles) */
  primary: string;
  primaryMuted: string;
  /** Duplicates / trade */
  trade: string;
  tradeBg: string;
  tradeBorder: string;
  /** Need / missing */
  need: string;
  needBg: string;
  needBorder: string;
  /** Owned / have */
  have: string;
  haveBg: string;
  haveBorder: string;
  /** Surfaces */
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
}

const WARM_DARK: ThemeClasses = {
  primary: 'text-amber-400',
  primaryMuted: 'text-amber-500/80',
  trade: 'text-amber-300',
  tradeBg: 'bg-amber-950/30',
  tradeBorder: 'border-amber-500/50',
  need: 'text-rose-400',
  needBg: 'bg-rose-950/25',
  needBorder: 'border-rose-500/50',
  have: 'text-emerald-400',
  haveBg: 'bg-emerald-950/20',
  haveBorder: 'border-emerald-500/50',
  surface: 'bg-stone-900/40',
  surfaceAlt: 'bg-stone-800/50',
  border: 'border-stone-600/40',
  text: 'text-stone-200',
  textMuted: 'text-stone-500',
};

const WARM_LIGHT: ThemeClasses = {
  primary: 'text-amber-700',
  primaryMuted: 'text-amber-600/90',
  trade: 'text-amber-800',
  tradeBg: 'bg-amber-100/80',
  tradeBorder: 'border-amber-400/60',
  need: 'text-rose-600',
  needBg: 'bg-rose-50',
  needBorder: 'border-rose-400/60',
  have: 'text-emerald-700',
  haveBg: 'bg-emerald-50/80',
  haveBorder: 'border-emerald-500/50',
  surface: 'bg-stone-100',
  surfaceAlt: 'bg-stone-200/60',
  border: 'border-stone-300',
  text: 'text-stone-800',
  textMuted: 'text-stone-500',
};

const COOL_DARK: ThemeClasses = {
  primary: 'text-sky-400',
  primaryMuted: 'text-sky-500/80',
  trade: 'text-indigo-300',
  tradeBg: 'bg-indigo-950/30',
  tradeBorder: 'border-indigo-500/50',
  need: 'text-rose-400',
  needBg: 'bg-rose-950/25',
  needBorder: 'border-rose-500/50',
  have: 'text-emerald-400',
  haveBg: 'bg-emerald-950/20',
  haveBorder: 'border-emerald-500/40',
  surface: 'bg-slate-900/40',
  surfaceAlt: 'bg-slate-800/50',
  border: 'border-slate-600/40',
  text: 'text-slate-200',
  textMuted: 'text-slate-500',
};

const COOL_LIGHT: ThemeClasses = {
  primary: 'text-sky-700',
  primaryMuted: 'text-sky-600/90',
  trade: 'text-indigo-700',
  tradeBg: 'bg-indigo-50/90',
  tradeBorder: 'border-indigo-400/60',
  need: 'text-rose-600',
  needBg: 'bg-rose-50',
  needBorder: 'border-rose-400/60',
  have: 'text-emerald-700',
  haveBg: 'bg-emerald-50/80',
  haveBorder: 'border-emerald-500/50',
  surface: 'bg-slate-50',
  surfaceAlt: 'bg-slate-100',
  border: 'border-slate-300',
  text: 'text-slate-800',
  textMuted: 'text-slate-500',
};

const FOREST_DARK: ThemeClasses = {
  primary: 'text-emerald-400',
  primaryMuted: 'text-emerald-500/80',
  trade: 'text-teal-300',
  tradeBg: 'bg-teal-950/30',
  tradeBorder: 'border-teal-500/50',
  need: 'text-rose-400',
  needBg: 'bg-rose-950/25',
  needBorder: 'border-rose-500/50',
  have: 'text-green-400',
  haveBg: 'bg-green-950/20',
  haveBorder: 'border-green-500/40',
  surface: 'bg-stone-900/40',
  surfaceAlt: 'bg-stone-800/50',
  border: 'border-stone-600/40',
  text: 'text-stone-200',
  textMuted: 'text-stone-500',
};

const FOREST_LIGHT: ThemeClasses = {
  primary: 'text-emerald-700',
  primaryMuted: 'text-emerald-600/90',
  trade: 'text-teal-700',
  tradeBg: 'bg-teal-50/90',
  tradeBorder: 'border-teal-400/60',
  need: 'text-rose-600',
  needBg: 'bg-rose-50',
  needBorder: 'border-rose-400/60',
  have: 'text-green-700',
  haveBg: 'bg-green-50/80',
  haveBorder: 'border-green-500/50',
  surface: 'bg-stone-50',
  surfaceAlt: 'bg-stone-100',
  border: 'border-stone-300',
  text: 'text-stone-800',
  textMuted: 'text-stone-500',
};

const SEASON_DARK: ThemeClasses = {
  primary: 'text-[#EDCE99]',
  primaryMuted: 'text-[#EAD7C2]/80',
  trade: 'text-amber-300',
  tradeBg: 'bg-amber-950/30',
  tradeBorder: 'border-[#D69858]/60',
  need: 'text-rose-400',
  needBg: 'bg-rose-950/25',
  needBorder: 'border-rose-500/50',
  have: 'text-emerald-400',
  haveBg: 'bg-emerald-950/20',
  haveBorder: 'border-emerald-500/40',
  surface: 'bg-[#975A31]/20',
  surfaceAlt: 'bg-[#975A31]/15',
  border: 'border-[#D69858]/50',
  text: 'text-[#EAD7C2]',
  textMuted: 'text-[#EAD7C2]/70',
};

const SEASON_LIGHT: ThemeClasses = {
  primary: 'text-[#975A31]',
  primaryMuted: 'text-[#975A31]/80',
  trade: 'text-amber-800',
  tradeBg: 'bg-amber-50/90',
  tradeBorder: 'border-[#D69858]',
  need: 'text-rose-600',
  needBg: 'bg-rose-50',
  needBorder: 'border-rose-400/60',
  have: 'text-emerald-700',
  haveBg: 'bg-emerald-50/80',
  haveBorder: 'border-emerald-500/50',
  surface: 'bg-[#EAD7C2]',
  surfaceAlt: 'bg-[#EDCE99]/80',
  border: 'border-[#D69858]/70',
  text: 'text-stone-800',
  textMuted: 'text-stone-600',
};

export function getThemeClasses(
  colorTheme: ColorTheme,
  isDark: boolean
): ThemeClasses {
  if (colorTheme === 'cool') return isDark ? COOL_DARK : COOL_LIGHT;
  if (colorTheme === 'forest') return isDark ? FOREST_DARK : FOREST_LIGHT;
  if (colorTheme === 'season') return isDark ? SEASON_DARK : SEASON_LIGHT;
  return isDark ? WARM_DARK : WARM_LIGHT;
}

/** Button accent background for primary actions (theme-aware). */
export function getPrimaryButtonClasses(colorTheme: ColorTheme): string {
  const map: Record<ColorTheme, string> = {
    warm: 'bg-amber-600 hover:bg-amber-500 text-stone-900',
    cool: 'bg-sky-600 hover:bg-sky-500 text-white',
    forest: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    season: 'bg-[#975A31] hover:bg-[#B56B3C] text-[#EAD7C2] border border-[#D69858]',
  };
  return map[colorTheme];
}

/** Card tile: left border + bg for "have" (owned). */
export function getHaveTileClasses(colorTheme: ColorTheme): string {
  const map: Record<ColorTheme, string> = {
    warm: 'border-l-emerald-500/80 border border-emerald-500/40 bg-emerald-950/15',
    cool: 'border-l-emerald-500/80 border border-emerald-500/40 bg-emerald-950/15',
    forest: 'border-l-green-500/80 border border-green-500/40 bg-green-950/15',
    season: 'border-l-emerald-500/80 border border-emerald-500/40 bg-emerald-950/15',
  };
  return map[colorTheme];
}

/** Card tile: left border + bg for duplicate (trade). */
export function getTradeTileClasses(colorTheme: ColorTheme): string {
  const map: Record<ColorTheme, string> = {
    warm: 'border-l-amber-400 border border-amber-400/60 bg-amber-950/25',
    cool: 'border-l-indigo-400 border border-indigo-400/60 bg-indigo-950/25',
    forest: 'border-l-teal-400 border border-teal-400/60 bg-teal-950/25',
    season: 'border-l-[#D69858] border border-[#D69858]/60 bg-amber-950/25',
  };
  return map[colorTheme];
}
