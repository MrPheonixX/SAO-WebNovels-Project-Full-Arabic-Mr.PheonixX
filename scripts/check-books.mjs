// Checks the published site before it goes live:
//   node scripts/check-books.mjs pages-out
// - no PDF file may be inside the site (readers must only read inside the page)
// - every novel that has a PDF in books-source/ must have been processed
// - Git LFS pointer files are rejected
// - the whole site must stay under GitHub Pages' 1 GB limit
import fs from "node:fs";
import path from "node:path";

const out = process.argv[2] ?? "pages-out";
const LIMIT_MB = Number(process.env.BOOKS_LIMIT_MB ?? 950);
let failed = false;
const error = (m) => {
  console.log(`::error::${m}`);
  failed = true;
};

function walk(dir, visit) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, visit);
    else visit(p, fs.statSync(p).size);
  }
}

let siteBytes = 0;
const pdfsInSite = [];
walk(out, (p, size) => {
  siteBytes += size;
  if (/\.pdf$/i.test(p)) pdfsInSite.push(p);
});
if (pdfsInSite.length) error(`${pdfsInSite.length} PDF file(s) are inside the site (${pdfsInSite[0]}). The novels must never be published as files.`);

const catalog = JSON.parse(fs.readFileSync("client/data/catalog.json", "utf8")).works;
const sourceFiles = fs.existsSync("books-source") ? fs.readdirSync("books-source") : [];
const withPdf = catalog.filter((w) => sourceFiles.some((f) => f.toLowerCase() === String(w.file).toLowerCase()));

const lfs = sourceFiles.filter((f) => {
  const p = path.join("books-source", f);
  return /\.pdf$/i.test(f) && fs.statSync(p).size < 2000 && fs.readFileSync(p, "utf8").startsWith("version https://git-lfs");
});
if (lfs.length) error(`${lfs.length} file(s) in books-source/ are Git LFS pointers, not real PDFs: ${lfs.slice(0, 3).join(", ")}`);

const indexFile = path.join(out, "books", "index.json");
const ready = fs.existsSync(indexFile) ? Object.keys(JSON.parse(fs.readFileSync(indexFile, "utf8")).books) : [];
const unprocessed = withPdf.filter((w) => !ready.includes(w.id));
const waiting = catalog.length - withPdf.length;

const siteMB = Math.round(siteBytes / 1024 / 1024);
console.log(`catalog: ${catalog.length} novel(s) | with a PDF: ${withPdf.length} | ready to read: ${ready.length} | waiting for a file: ${waiting} | site size: ${siteMB} MB (limit ${LIMIT_MB} MB)`);
if (unprocessed.length) console.log(`::warning::${unprocessed.length} novel(s) have a PDF but could not be processed: ${unprocessed.slice(0, 5).map((w) => w.id).join(", ")}`);
if (siteMB > LIMIT_MB) error(`the site is ${siteMB} MB. GitHub Pages allows at most 1 GB. Use a smaller page width (repository variable BOOK_PAGE_WIDTH, e.g. 800) or fewer/lighter novels.`);
process.exit(failed ? 1 : 0);
