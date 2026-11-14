// Where to read a book from. The catalog stores each book's address in the
// external content repository; the site first looks for the same file inside its
// own folder (books/), which the deploy workflow fills, and only then falls back
// to the external address.
const BASE: string = (import.meta as any).env?.BASE_URL ?? "/";

/** File name of a catalog address, still percent-encoded exactly as in the URL. */
export function pdfFileName(rawUrl: string): string {
  try {
    return new URL(rawUrl, "https://example.invalid/").pathname.split("/").pop() ?? "";
  } catch {
    return "";
  }
}

export function pdfSources(rawUrl: string): string[] {
  const file = pdfFileName(rawUrl);
  const sources: string[] = [];
  if (/^[^/\\]+\.pdf$/i.test(file)) sources.push(`${BASE}books/${file}`);
  sources.push(rawUrl);
  return sources;
}
