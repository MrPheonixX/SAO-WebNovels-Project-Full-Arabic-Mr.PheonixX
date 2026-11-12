// Loads a PDF into a blob: URL that an <iframe> can display.
//
// On a static host (GitHub Pages) there is no server, so the browser fetches
// the file straight from the content repo (raw.githubusercontent.com allows
// cross-origin reads). If that fails, the optional /api/proxy-pdf route is
// tried, which exists when the site runs on Node/Netlify.
const BASE: string = (import.meta as any).env?.BASE_URL ?? "/";

export interface LoadPdfOptions {
  signal?: AbortSignal;
  /** 0-100, only reported when the server sends the file size. */
  onProgress?: (percent: number) => void;
}

async function readAsBlobUrl(res: Response, opts: LoadPdfOptions): Promise<string> {
  const total = Number(res.headers.get("content-length")) || 0;
  const chunks: Uint8Array[] = [];
  if (res.body) {
    const reader = res.body.getReader();
    let received = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.length;
      if (total > 0) opts.onProgress?.(Math.min(99, Math.round((received / total) * 100)));
    }
  } else {
    chunks.push(new Uint8Array(await res.arrayBuffer()));
  }
  return URL.createObjectURL(new Blob(chunks as BlobPart[], { type: "application/pdf" }));
}

export async function loadPdfBlobUrl(
  sourceUrl: string,
  opts: LoadPdfOptions = {},
): Promise<string> {
  const attempts = [
    sourceUrl,
    `${BASE}api/proxy-pdf?url=${encodeURIComponent(sourceUrl)}`,
  ];
  let lastError: unknown = new Error("PDF could not be loaded");
  for (const url of attempts) {
    try {
      const res = await fetch(url, { signal: opts.signal });
      if (!res.ok) {
        lastError = new Error(`HTTP ${res.status}`);
        continue;
      }
      return await readAsBlobUrl(res, opts);
    } catch (err) {
      if (opts.signal?.aborted) throw err;
      lastError = err;
    }
  }
  throw lastError;
}
