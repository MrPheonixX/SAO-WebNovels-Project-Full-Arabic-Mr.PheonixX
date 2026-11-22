// What the site knows about the processed novels (books/index.json, written at
// deploy time by scripts/render-books.mjs): which books are ready, how many pages
// they have, and the addresses of their page images, thumbnails and covers.
// The PDF files themselves are never served.
import { useSyncExternalStore } from "react";

const BASE: string = (import.meta as any).env?.BASE_URL ?? "/";

export interface BookInfo {
  pages: number;
  /** page image width in px */
  width: number;
  /** page height / width of the usual page */
  ratio: number;
  /** pages with a different shape: page number -> height/width */
  odd: Record<string, number>;
  /** one letter per page: "g" = grayscale PNG, "c" = colour WebP */
  kinds: string;
  text: boolean;
  cover: boolean;
}

export interface BooksIndex {
  generatedAt: string;
  books: Record<string, BookInfo>;
}

let index: BooksIndex | null = null;
let loaded = false;
let version = 0;
const listeners = new Set<() => void>();
const emit = () => {
  version += 1;
  listeners.forEach((l) => l());
};

export async function loadBooksIndex(): Promise<void> {
  try {
    const res = await fetch(`${BASE}books/index.json`, { cache: "no-cache" });
    if (res.ok) {
      const json = (await res.json()) as BooksIndex;
      if (json && typeof json === "object" && json.books) index = json;
    }
  } catch {
    /* offline or not deployed yet: stay "unknown" */
  }
  loaded = true;
  emit();
}

/** Test helper. */
export function __setBooksIndexForTests(value: BooksIndex | null): void {
  index = value;
  loaded = true;
  version += 1;
  listeners.forEach((l) => l());
}

export const getBookInfo = (id: string): BookInfo | undefined => index?.books[id];

/**
 * true = the book is processed and can be read, false = it is not there yet,
 * null = the index has not been loaded (do not hide anything while unknown).
 */
export function isBookReadable(id: string): boolean | null {
  if (!loaded || !index) return null;
  return Boolean(index.books[id]);
}

const pad = (n: number) => String(n).padStart(4, "0");
export const bookDir = (id: string) => `${BASE}books/${id}/`;
export const coverUrl = (id: string) => `${bookDir(id)}cover.webp`;
export const thumbUrl = (id: string, page: number) => `${bookDir(id)}t-${pad(page)}.webp`;
export const textUrl = (id: string) => `${bookDir(id)}text.json`;
export function pageUrl(id: string, info: Pick<BookInfo, "kinds">, page: number): string {
  const kind = info.kinds[page - 1] === "c" ? "webp" : "png";
  return `${bookDir(id)}p-${pad(page)}.${kind}`;
}
export const pageRatio = (info: Pick<BookInfo, "ratio" | "odd">, page: number): number =>
  info.odd[String(page)] ?? info.ratio;

/** Re-renders the component when the index loads or changes. */
export function useBooksIndex(): number {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => version,
    () => version,
  );
}
