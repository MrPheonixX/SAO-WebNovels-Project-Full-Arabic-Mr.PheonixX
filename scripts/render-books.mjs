// Turns the novels (PDF files in books-source/) into what the website shows:
//   books/<id>/p-0001.png|webp   one image per page (grayscale pages are 16-level PNG, colour pages WebP)
//   books/<id>/t-0001.webp       small page thumbnails
//   books/<id>/cover.webp        cover (custom image in books-source/covers/<id>.* or the first page)
//   books/<id>/text.json         the page text, for the text mode / read-aloud / search (when the PDF has real text)
//   books/<id>/meta.json         page count, sizes, ...
//   books/index.json             summary of every rendered book
// The site never serves the PDF files themselves, so nothing can be downloaded.
//
// Usage: node scripts/render-books.mjs --in books-source --out books-rendered
// Needs poppler-utils (pdfinfo, pdftoppm, pdftotext) and the "sharp" package.
import crypto from "node:crypto";
import { execFile } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);
const RENDER_VERSION = 3;

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith("--") ? [...acc, [a.slice(2), all[i + 1]]] : acc), []),
);
const IN = args.in ?? "books-source";
const OUT = args.out ?? "books-rendered";
const CATALOG = args.catalog ?? "client/data/catalog.json";
const BUDGET_MB = Number(args.budget ?? process.env.BOOKS_BUDGET_MB ?? 750);
const CONCURRENCY = Number(args.concurrency ?? Math.max(2, os.cpus().length));
const CHUNK = 20;

const sharp = await import("sharp").then((m) => m.default).catch(() => {
  console.error("The 'sharp' package is missing. Run: npm install");
  process.exit(1);
});

const pad = (n) => String(n).padStart(4, "0");
const log = (...a) => console.log(...a);

async function pool(items, size, fn) {
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        await fn(items[i], i);
      }
    }),
  );
}

async function pdfInfo(file) {
  const { stdout } = await run("pdfinfo", [file], { maxBuffer: 10 * 1024 * 1024 });
  const pages = Number(/^Pages:\s+(\d+)/m.exec(stdout)?.[1] ?? 0);
  const size = /^Page size:\s+([\d.]+) x ([\d.]+)/m.exec(stdout);
  return { pages, w: Number(size?.[1] ?? 595), h: Number(size?.[2] ?? 842) };
}

function sha1(file) {
  const h = crypto.createHash("sha1");
  h.update(fs.readFileSync(file));
  return h.digest("hex");
}

/**
 * Reflowable text. pdftotext gives one text line per printed line; lines are joined into
 * paragraphs, starting a new paragraph after a clearly short line (the last line of a
 * paragraph, a heading). Layout control characters are removed.
 */
export function cleanPageText(raw) {
  const text = raw
    .replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069\uFEFF\u0640]/g, "") // layout marks and tatweel (elongation)
    .normalize("NFKC") // Arabic presentation forms -> ordinary letters
    .replace(/\r/g, "");
  const blocks = text.split(/\n\s*\n/).map((b) => b.split("\n").map((l) => l.trim()).filter(Boolean)).filter((b) => b.length);
  const lengths = blocks.flat().map((l) => l.length).sort((x, y) => y - x);
  const typical = lengths.length ? lengths[Math.min(lengths.length - 1, Math.floor(lengths.length * 0.1))] : 0; // near the longest lines
  const paragraphs = [];
  for (const lines of blocks) {
    let current = [];
    for (const line of lines) {
      current.push(line);
      if (line.length < typical * 0.62) {
        paragraphs.push(current.join(" "));
        current = [];
      }
    }
    if (current.length) paragraphs.push(current.join(" "));
  }
  return paragraphs.map((p) => p.replace(/\s+/g, " ").trim()).filter((p) => p && !/^\d{1,4}$/.test(p)); // drop bare page numbers
}

async function extractText(pdf, pages) {
  try {
    const { stdout } = await run("pdftotext", ["-enc", "UTF-8", pdf, "-"], { maxBuffer: 512 * 1024 * 1024 });
    const parts = stdout.split("\f");
    const out = Array.from({ length: pages }, (_, i) => cleanPageText(parts[i] ?? ""));
    const letters = out.flat().join("").replace(/[^\p{L}]/gu, "").length;
    return letters / Math.max(1, pages) > 80 ? out : null; // scanned books have no real text
  } catch {
    return null;
  }
}

async function isColour(buf) {
  const { data } = await sharp(buf).resize(48, 48, { fit: "fill" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 3) {
    if (Math.max(data[i], data[i + 1], data[i + 2]) - Math.min(data[i], data[i + 1], data[i + 2]) > 28) return true;
  }
  return false;
}

async function processPage(png, n, dir, results) {
  const buf = fs.readFileSync(png);
  const meta = await sharp(buf).metadata();
  const colour = await isColour(buf);
  if (colour) {
    await sharp(buf).webp({ quality: 65, effort: 4 }).toFile(path.join(dir, `p-${pad(n)}.webp`));
  } else {
    await sharp(buf)
      .grayscale()
      .png({ palette: true, colours: 16, dither: 0, effort: 7, compressionLevel: 9 })
      .toFile(path.join(dir, `p-${pad(n)}.png`));
  }
  await sharp(buf).resize({ width: 150 }).webp({ quality: 50, effort: 4 }).toFile(path.join(dir, `t-${pad(n)}.webp`));
  results[n - 1] = { colour, w: meta.width, h: meta.height };
  return buf;
}

async function renderBook(work, pdf, width, hash) {
  const finalDir = path.join(OUT, work.id);
  const dir = finalDir + ".tmp";
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "book-"));
  try {
    const info = await pdfInfo(pdf);
    if (!info.pages) throw new Error("no pages");
    const results = new Array(info.pages);
    const chunks = [];
    for (let a = 1; a <= info.pages; a += CHUNK) chunks.push([a, Math.min(info.pages, a + CHUNK - 1)]);
    let firstPage = null;
    await pool(chunks, CONCURRENCY, async ([a, b], ci) => {
      const prefix = path.join(tmp, `c${ci}`);
      await run("pdftoppm", ["-scale-to-x", String(width), "-scale-to-y", "-1", "-f", String(a), "-l", String(b), "-png", pdf, prefix], {
        maxBuffer: 10 * 1024 * 1024,
      });
      for (const f of fs.readdirSync(tmp).filter((x) => x.startsWith(`c${ci}-`))) {
        const n = parseInt(/-(\d+)\.png$/.exec(f)[1], 10);
        const full = path.join(tmp, f);
        const buf = await processPage(full, n, dir, results);
        if (n === 1) firstPage = buf;
        fs.unlinkSync(full);
      }
    });
    if (results.some((r) => !r)) throw new Error("some pages could not be rendered");

    // cover: custom image first, otherwise page 1
    let cover = false;
    const customCover = ["png", "jpg", "jpeg", "webp"].map((e) => path.join(IN, "covers", `${work.id}.${e}`)).find((p) => fs.existsSync(p));
    const coverSource = customCover ? fs.readFileSync(customCover) : firstPage;
    if (coverSource) {
      await sharp(coverSource).resize({ width: 520, withoutEnlargement: true }).webp({ quality: 78, effort: 5 }).toFile(path.join(dir, "cover.webp"));
      cover = true;
    }

    // page shape: the most common height is the default, other pages are listed
    const counts = new Map();
    for (const r of results) counts.set(r.h, (counts.get(r.h) ?? 0) + 1);
    const mainH = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
    const odd = {};
    results.forEach((r, i) => {
      if (Math.abs(r.h - mainH) / mainH > 0.01) odd[i + 1] = Math.round((r.h / r.w) * 1000) / 1000;
    });

    const text = await extractText(pdf, info.pages);
    if (text) fs.writeFileSync(path.join(dir, "text.json"), JSON.stringify({ pages: text }));

    const meta = {
      id: work.id,
      hash,
      version: RENDER_VERSION,
      pages: info.pages,
      width,
      ratio: Math.round((mainH / results[0].w) * 1000) / 1000,
      odd,
      kinds: results.map((r) => (r.colour ? "c" : "g")).join(""),
      text: Boolean(text),
      cover,
    };
    fs.writeFileSync(path.join(dir, "meta.json"), JSON.stringify(meta));
    fs.rmSync(finalDir, { recursive: true, force: true });
    fs.renameSync(dir, finalDir);
    return meta;
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function dirSize(d) {
  let t = 0;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    t += e.isDirectory() ? dirSize(p) : fs.statSync(p).size;
  }
  return t;
}

async function main() {
  const catalog = JSON.parse(fs.readFileSync(CATALOG, "utf8")).works;
  fs.mkdirSync(OUT, { recursive: true });
  const present = fs.existsSync(IN) ? fs.readdirSync(IN) : [];
  const byFile = new Map(present.filter((f) => /\.pdf$/i.test(f)).map((f) => [f.toLowerCase(), f]));

  const todo = [];
  for (const work of catalog) {
    const real = byFile.get(String(work.file).toLowerCase());
    if (real) todo.push({ work, pdf: path.join(IN, real) });
  }
  const orphans = [...byFile.values()].filter((f) => !catalog.some((w) => String(w.file).toLowerCase() === f.toLowerCase()));
  if (orphans.length) log(`::warning::${orphans.length} PDF(s) in ${IN}/ are not in client/data/catalog.json and were skipped: ${orphans.slice(0, 4).join(", ")}`);
  const missing = catalog.filter((w) => !byFile.has(String(w.file).toLowerCase()));
  if (missing.length) log(`::warning::${missing.length} catalog work(s) have no PDF in ${IN}/ yet (they show as "coming soon"): ${missing.slice(0, 4).map((w) => w.file).join(", ")}${missing.length > 4 ? ", ..." : ""}`);

  // one page width for the whole library, chosen so the site stays well inside GitHub Pages' 1 GB
  const infos = [];
  for (const t of todo) infos.push(await pdfInfo(t.pdf).catch(() => ({ pages: 0 })));
  const totalPages = infos.reduce((n, i) => n + i.pages, 0);
  const steps = [1100, 1000, 900, 800, 700];
  const width = Number(args.width ?? process.env.BOOK_PAGE_WIDTH) || steps.find((w) => (totalPages * 0.06 * w * w) <= BUDGET_MB * 1024 * 1024) || 700;
  log(`${todo.length} book(s), ${totalPages} pages -> page width ${width}px (size budget ${BUDGET_MB} MB)`);

  const keep = new Set(todo.map((t) => t.work.id));
  for (const d of fs.readdirSync(OUT, { withFileTypes: true })) {
    if (d.isDirectory() && !keep.has(d.name)) fs.rmSync(path.join(OUT, d.name), { recursive: true, force: true });
  }

  const failed = [];
  const metas = {};
  for (const { work, pdf } of todo) {
    const hash = `${sha1(pdf)}-v${RENDER_VERSION}-w${width}-${fs.existsSync(path.join(IN, "covers")) ? fs.readdirSync(path.join(IN, "covers")).filter((f) => f.startsWith(work.id + ".")).join(",") : ""}`;
    const metaFile = path.join(OUT, work.id, "meta.json");
    try {
      if (fs.existsSync(metaFile)) {
        const m = JSON.parse(fs.readFileSync(metaFile, "utf8"));
        if (m.hash === hash) {
          metas[work.id] = m;
          log(`  cached   ${work.id} (${m.pages} pages)`);
          continue;
        }
      }
      const t0 = Date.now();
      const m = await renderBook(work, pdf, width, hash);
      metas[work.id] = m;
      log(`  rendered ${work.id}: ${m.pages} pages, ${(dirSize(path.join(OUT, work.id)) / 1024 / 1024).toFixed(1)} MB, text ${m.text ? "yes" : "no"}, ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    } catch (err) {
      failed.push(work.id);
      log(`::warning::could not render ${work.id}: ${err.message}`);
    }
  }

  const index = { generatedAt: new Date().toISOString(), books: {} };
  for (const [id, m] of Object.entries(metas)) {
    index.books[id] = { pages: m.pages, width: m.width, ratio: m.ratio, odd: m.odd, kinds: m.kinds, text: m.text, cover: m.cover };
  }
  fs.writeFileSync(path.join(OUT, "index.json"), JSON.stringify(index));
  const mb = Math.round(dirSize(OUT) / 1024 / 1024);
  log(`done: ${Object.keys(metas).length} book(s) ready, ${failed.length} failed, ${mb} MB in ${OUT}/`);
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
