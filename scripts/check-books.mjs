// Checks the published books folder before the site goes live.
//   node scripts/check-books.mjs pages-out
// - warns about catalog books that are not in books/ (the site would use the external repository for them)
// - fails if a file is a Git LFS pointer instead of a real PDF
// - fails if the whole site is close to GitHub Pages' 1 GB limit
import fs from "node:fs";
import path from "node:path";

const out = process.argv[2] ?? "pages-out";
const booksDir = path.join(out, "books");
const LIMIT_MB = Number(process.env.BOOKS_LIMIT_MB ?? 950);

const catalog = fs.readFileSync("client/data/pdfWorks.ts", "utf8");
const wanted = [...catalog.matchAll(/pdfUrlRaw:\s*"([^"]+)"/g)].map((m) =>
  decodeURIComponent(m[1].split("?")[0].split("/").pop() ?? ""),
);

const present = fs.existsSync(booksDir) ? fs.readdirSync(booksDir) : [];
const missing = wanted.filter((f) => !present.includes(f));
const lfs = present.filter((f) => {
  const p = path.join(booksDir, f);
  return fs.statSync(p).size < 2000 && fs.readFileSync(p, "utf8").startsWith("version https://git-lfs");
});

function dirSize(dir) {
  let total = 0;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    total += e.isDirectory() ? dirSize(p) : fs.statSync(p).size;
  }
  return total;
}
const siteMB = Math.round(dirSize(out) / 1024 / 1024);
const booksMB = fs.existsSync(booksDir) ? Math.round(dirSize(booksDir) / 1024 / 1024) : 0;

console.log(`books in the site: ${present.length} files, ${booksMB} MB (whole site ${siteMB} MB, limit ${LIMIT_MB} MB)`);
console.log(`catalog books: ${wanted.length}, found in books/: ${wanted.length - missing.length}`);

let failed = false;
if (missing.length) {
  console.log(`::warning::${missing.length} catalog book(s) are not in books/ and will be read from the external repository: ${missing.slice(0, 5).join(", ")}${missing.length > 5 ? ", ..." : ""}`);
}
if (lfs.length) {
  console.log(`::error::${lfs.length} file(s) are Git LFS pointers, not real PDFs: ${lfs.slice(0, 3).join(", ")}`);
  failed = true;
}
if (siteMB > LIMIT_MB) {
  console.log(`::error::the site is ${siteMB} MB. GitHub Pages allows at most 1 GB, so the deploy would fail. Keep the largest books in the external repository (they are used as a fallback) or reduce the PDFs' size.`);
  failed = true;
}
process.exit(failed ? 1 : 0);
