// Pure helpers that turn the real catalog (client/data/pdfWorks.ts) into the
// lists shown on the series pages. Kept free of React so they can be tested.
import { pdfWorks, type PDFWork } from "../data/pdfWorks";

export type LibraryFilter = "all" | "unread" | "opened";
export type LibrarySort = "order" | "rating" | "pages";

/** All works of one series, in reading order (volumes first, extras last). */
export function seriesVolumes(series: string): PDFWork[] {
  return pdfWorks
    .filter((w) => w.series === series)
    .map((w, index) => ({ w, index }))
    .sort((a, b) => {
      const av = a.w.volumeNumber ?? Number.MAX_SAFE_INTEGER;
      const bv = b.w.volumeNumber ?? Number.MAX_SAFE_INTEGER;
      return av - bv || a.index - b.index;
    })
    .map(({ w }) => w);
}

/** Distinct arcs, in the order they first appear. */
export function seriesArcs(volumes: PDFWork[]): string[] {
  const seen: string[] = [];
  for (const v of volumes) if (v.arc && !seen.includes(v.arc)) seen.push(v.arc);
  return seen;
}

export interface LibraryQuery {
  query: string;
  arc: string; // "all" or an arc name
  filter: LibraryFilter;
  sort: LibrarySort;
  /** ids the reader has opened before (from the reading history) */
  opened: ReadonlySet<string>;
  isHidden: (id: string) => boolean;
}

export function filterAndSort(volumes: PDFWork[], q: LibraryQuery): PDFWork[] {
  const needle = q.query.trim().toLowerCase();
  const out = volumes.filter((v) => {
    if (q.isHidden(v.id)) return false;
    if (q.arc !== "all" && v.arc !== q.arc) return false;
    if (q.filter === "opened" && !q.opened.has(v.id)) return false;
    if (q.filter === "unread" && q.opened.has(v.id)) return false;
    if (!needle) return true;
    return [v.titleAr, v.titleEn, v.arc ?? "", v.description ?? ""].some((s) =>
      s.toLowerCase().includes(needle),
    );
  });
  if (q.sort === "rating") out.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  if (q.sort === "pages") out.sort((a, b) => (b.pages ?? 0) - (a.pages ?? 0));
  return out; // "order" keeps the reading order given by seriesVolumes()
}
