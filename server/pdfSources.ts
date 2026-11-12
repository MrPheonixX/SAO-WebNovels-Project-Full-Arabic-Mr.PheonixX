/**
 * Allow-list for /api/proxy-pdf. Only PDFs from the project's own content
 * repo can be proxied (previously any file on github.com / raw.githubusercontent
 * .com / jsDelivr could be fetched through the server).
 *
 * Extra sources can be added with PDF_PROXY_ALLOWED_PREFIXES, a comma-separated
 * list of "host/path-prefix" entries, e.g.
 *   raw.githubusercontent.com/SomeUser/SomeRepo/
 */
const REPO = "MrPheonixX/My-Works-PDF-";

const DEFAULT_PREFIXES: Array<{ host: string; prefix: string }> = [
  { host: "raw.githubusercontent.com", prefix: `/${REPO}/` },
  { host: "github.com", prefix: `/${REPO}/raw/` },
  { host: "cdn.jsdelivr.net", prefix: `/gh/${REPO}` },
];

function parseExtra(raw: string | undefined) {
  return (raw ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((entry) => {
      const slash = entry.indexOf("/");
      return slash > 0
        ? { host: entry.slice(0, slash).toLowerCase(), prefix: entry.slice(slash) }
        : null;
    })
    .filter((x): x is { host: string; prefix: string } => x !== null);
}

export function isAllowedPdfUrl(
  raw: string,
  extra: string | undefined = process.env.PDF_PROXY_ALLOWED_PREFIXES,
): boolean {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  if (url.protocol !== "https:" || url.username || url.password || url.port) {
    return false;
  }
  // URL() already collapses "." / ".." segments, so the prefix check below
  // cannot be bypassed with path traversal.
  if (!url.pathname.toLowerCase().endsWith(".pdf")) return false;
  const host = url.hostname.toLowerCase();
  return [...DEFAULT_PREFIXES, ...parseExtra(extra)].some(
    (rule) => rule.host === host && url.pathname.startsWith(rule.prefix),
  );
}
