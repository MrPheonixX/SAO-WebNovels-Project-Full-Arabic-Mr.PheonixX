// Pure logic of the reader (no React): preferences, page spreads for the book mode,
// keyboard / swipe direction, themes. Kept separate so it can be tested.
export type ReaderMode = "scroll" | "slide" | "book" | "text";
export type ReaderTheme = "day" | "night" | "sepia";
export type FontKey = "naskh" | "amiri" | "cairo" | "tajawal" | "scheherazade" | "system";

export const MODES: { id: ReaderMode; label: string }[] = [
  { id: "scroll", label: "تمرير" },
  { id: "slide", label: "شرائح" },
  { id: "book", label: "كتاب" },
  { id: "text", label: "نص" },
];
export const THEMES: { id: ReaderTheme; label: string }[] = [
  { id: "day", label: "نهاري" },
  { id: "sepia", label: "ورقي" },
  { id: "night", label: "ليلي" },
];
export const FONTS: Record<FontKey, { label: string; css: string }> = {
  naskh: { label: "نسخ", css: '"Noto Naskh Arabic", "Amiri", serif' },
  amiri: { label: "أميري", css: '"Amiri", "Noto Naskh Arabic", serif' },
  scheherazade: { label: "شهرزاد", css: '"Scheherazade New", "Amiri", serif' },
  cairo: { label: "القاهرة", css: '"Cairo", "Noto Sans Arabic", sans-serif' },
  tajawal: { label: "تجوّل", css: '"Tajawal", "Noto Sans Arabic", sans-serif' },
  system: { label: "النظام", css: 'system-ui, "Segoe UI", Tahoma, sans-serif' },
};

export const ZOOMS = [0.6, 0.8, 1, 1.25, 1.5, 2, 2.5, 3];

export interface ReaderPrefs {
  mode: ReaderMode;
  theme: ReaderTheme;
  /** index in ZOOMS (2 = 100% = fit) */
  zoomIndex: number;
  /** Arabic books turn pages from right to left */
  rtl: boolean;
  brightness: number;
  fontFamily: FontKey;
  fontSize: number;
  lineHeight: number;
  textWidth: number;
  ttsRate: number;
  /** auto-scroll speed, px per second */
  scrollSpeed: number;
  /** paper sound when a page is turned (slides and book) */
  sound: boolean;
}

export const DEFAULT_PREFS: ReaderPrefs = {
  mode: "scroll",
  theme: "day",
  zoomIndex: 2,
  rtl: true,
  brightness: 1,
  fontFamily: "naskh",
  fontSize: 24,
  lineHeight: 2,
  textWidth: 720,
  ttsRate: 1,
  scrollSpeed: 40,
  sound: true,
};

const num = (v: unknown, min: number, max: number, fallback: number) =>
  typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;

/** Accepts whatever is stored and returns valid preferences. */
export function sanitizePrefs(raw: unknown): ReaderPrefs {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const d = DEFAULT_PREFS;
  return {
    mode: MODES.some((m) => m.id === r.mode) ? (r.mode as ReaderMode) : d.mode,
    theme: THEMES.some((t) => t.id === r.theme) ? (r.theme as ReaderTheme) : d.theme,
    zoomIndex: Math.round(num(r.zoomIndex, 0, ZOOMS.length - 1, d.zoomIndex)),
    rtl: typeof r.rtl === "boolean" ? r.rtl : d.rtl,
    brightness: num(r.brightness, 0.5, 1.3, d.brightness),
    fontFamily: r.fontFamily && (r.fontFamily as string) in FONTS ? (r.fontFamily as FontKey) : d.fontFamily,
    fontSize: Math.round(num(r.fontSize, 14, 44, d.fontSize)),
    lineHeight: num(r.lineHeight, 1.4, 3, d.lineHeight),
    textWidth: Math.round(num(r.textWidth, 420, 1100, d.textWidth)),
    ttsRate: num(r.ttsRate, 0.5, 2, d.ttsRate),
    scrollSpeed: Math.round(num(r.scrollSpeed, 10, 200, d.scrollSpeed)),
    sound: typeof r.sound === "boolean" ? r.sound : d.sound,
  };
}

export const clampPage = (n: number, total: number) => Math.min(Math.max(1, Math.round(n) || 1), Math.max(1, total));

/**
 * Pages shown together in the book mode. The cover is alone, then pairs (2,3), (4,5)...
 * "later" is the page that is read second (right side of an LTR book, left side of an RTL one).
 */
export interface Spread {
  earlier?: number;
  later?: number;
}

export function buildSpreads(total: number, single = false): Spread[] {
  if (total <= 0) return [];
  if (single) return Array.from({ length: total }, (_, i) => ({ later: i + 1 }));
  const spreads: Spread[] = [{ later: 1 }];
  for (let p = 2; p <= total; p += 2) spreads.push(p + 1 <= total ? { earlier: p, later: p + 1 } : { earlier: p });
  return spreads;
}

export function spreadOfPage(spreads: Spread[], page: number): number {
  const i = spreads.findIndex((s) => s.earlier === page || s.later === page);
  return i < 0 ? 0 : i;
}

/** First page of a spread (what the page indicator shows). */
export const spreadPage = (s: Spread | undefined): number => s?.earlier ?? s?.later ?? 1;

/** Which way a key / swipe moves: +1 = next page, -1 = previous page. */
export function keyDirection(key: string, rtl: boolean): 1 | -1 | 0 {
  if (key === "ArrowLeft") return rtl ? 1 : -1;
  if (key === "ArrowRight") return rtl ? -1 : 1;
  if (key === "PageDown" || key === "ArrowDown") return 1;
  if (key === "PageUp" || key === "ArrowUp") return -1;
  return 0;
}

/**
 * The next page of a left-to-right book is revealed by pulling the page to the left
 * (dx < 0); in a right-to-left (Arabic) book the next page lies on the left, so it is
 * revealed by pulling the page to the right (dx > 0).
 */
export function swipeDirection(dx: number, rtl: boolean, threshold = 48): 1 | -1 | 0 {
  if (Math.abs(dx) < threshold) return 0;
  const toLeft = dx < 0;
  return toLeft !== rtl ? 1 : -1;
}

export function imageFilter(theme: ReaderTheme, brightness: number): string {
  const b = `brightness(${brightness})`;
  if (theme === "night") return `invert(1) hue-rotate(180deg) contrast(0.92) ${b}`;
  if (theme === "sepia") return `sepia(0.5) contrast(0.96) ${b}`;
  return brightness === 1 ? "none" : b;
}

export const themeBackground = (theme: ReaderTheme): string =>
  theme === "night" ? "#0a0a0c" : theme === "sepia" ? "#e9dfc7" : "#2a2d36";

/** Width of the pages in the scroll mode. */
export function scrollPageWidth(containerWidth: number, zoomIndex: number): number {
  const base = Math.min(Math.max(280, containerWidth - 24), 860);
  return Math.round(base * ZOOMS[zoomIndex]);
}

export interface Bookmark {
  page: number;
  at: string;
}

export function toggleBookmarkList(list: Bookmark[], page: number, now = new Date().toISOString()): Bookmark[] {
  return list.some((b) => b.page === page)
    ? list.filter((b) => b.page !== page)
    : [...list, { page, at: now }].sort((a, b) => a.page - b.page);
}
