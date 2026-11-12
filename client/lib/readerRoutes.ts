// Maps the old /reader/<kind>/<id> links (used by the library pages) to a real
// PDF in the catalog, so every "read" button opens the actual book.
import { getWorkById, pdfWorks, type PDFWork } from "../data/pdfWorks";

// SideWorksLibrary uses short ids; the catalog uses longer ones.
const SIDEWORK_IDS: Record<string, string> = {
  nhk: "welcome-to-nhk",
  "no-longer-human": "no-longer-human-dazai",
};

const SERIES_NAMES: Record<string, string> = {
  sao: "Sword Art Online",
  progressive: "Sword Art Online Progressive",
};

export function resolveWork(
  kind: string | undefined,
  id: string | undefined,
): PDFWork | undefined {
  if (!kind || !id) return undefined;

  const seriesName = SERIES_NAMES[kind];
  if (seriesName) {
    if (!/^\d{1,3}$/.test(id)) return undefined;
    const volume = Number(id);
    return pdfWorks.find(
      (w) => w.series === seriesName && w.volumeNumber === volume,
    );
  }

  if (kind === "sidework") return getWorkById(SIDEWORK_IDS[id] ?? id);

  // lightnovel / classic / anime: those pages have their own lists and no PDFs yet
  return undefined;
}
