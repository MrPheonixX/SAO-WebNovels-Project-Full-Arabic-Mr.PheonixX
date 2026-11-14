# CHANGES — full scan, fixes and new features (Nov 2026)

## 000. Hotfix 3: reading only inside the site, novels inside the site, stable login

| Request | What was done |
|---------|---------------|
| **Nothing may be downloaded; read only on the website** | The book is always drawn inside the page (pdf.js). There is no browser PDF toolbar, no "download", no "open in a new tab" and no right-click "save image" on the pages. Listing pages (home, libraries, series) never request any PDF; only the reader requests the one book being read. Checked in a real browser. |
| **Novels inside the website, not in another repository** | The site now looks for each book in its own `books/` folder first. The deploy workflow copies every PDF of the content repository into the published site's `books/` folder (and keeps any PDF you commit in `public/books/`). The external repository is only a fallback. A checker (`scripts/check-books.mjs`) warns about missing books, rejects Git-LFS pointer files and stops the deploy if the site would exceed GitHub Pages' 1 GB limit. |
| **Login useless / logged out automatically / home page looks logged out** | Two real bugs: (1) several requests refreshed the login token at the same time; Supabase tokens are single-use, so all but one failed and the reader was logged out. Now only one refresh runs at a time, a network or server error never logs anyone out, and an expired token is refreshed and retried once. (2) The home page always showed "تسجيل دخول" even when signed in. Now the home page, the libraries and the series pages show the reader's name with a sign-out button, and the login page sends signed-in readers to their profile. Both are covered by tests that fail on the old code. |
| Arabic text problems | Corrupted letters were repaired earlier; this version also adds a fallback Arabic font stack and uses the same (Latin) digits for dates and numbers everywhere. |
| Pages fail to load / navigation errors | Fixed in the previous hotfix (crash on the PDF library page, old service worker). Every internal link was re-checked against the real routes: none is broken. |

**Things to know**
- GitHub Pages publishes at most **1 GB**. If the novels together are larger, the deploy stops with a clear message; keep the biggest ones only in the external repository (they keep working as a fallback) or reduce the PDFs' size.
- "No download" cannot be absolute: a reader can still screenshot, and anyone who knows a file's address (`/books/<name>.pdf`) can fetch it. The site simply never offers or uses that path to readers.
- Optional repository variable `CONTENT_REPO` changes which repository the novels are copied from (default `MrPheonixX/My-Works-PDF-`).

---

## 00. Hotfix 2 (from the screenshots): crash on the PDF library page, corrupted letters, wrong claims

| Problem seen | Cause | Fix |
|--------------|-------|-----|
| Error screen **"statusVersion is not defined"** when opening "عرض جميع الأعمال" (PDFWorksLibrary) | My earlier edit declared the variable inside the wrong function. It built fine but crashed when the page opened. **The previous zip contained this bug.** | Fixed. New build step `scripts/check-names.mjs` (runs in the Pages workflow before the build) stops the deploy if any code uses a name that does not exist. |
| Letters shown as black diamonds with a question mark (in the word "مميزة", the ✨ emoji next to "السحر", and others) | The original project files already contained corrupted characters (21 source files and 9 documents) | All repaired (including the ✨ emoji) |
| Home page said "أول منصة رسمية", "9 Volumes" for Progressive, "100% protection", "3D flipbook", "instant linguistic analysis", "Arabic voice", "offline reading", and a features section with fake completion percentages | Marketing text from the demo that no longer matched the site | Rewritten to match what exists today (reading inside the site, accounts and history, ratings, install as an app) with a separate honest "coming soon" list; numbers now come from the catalog |
| "28" shown after the English words (mixed right-to-left text) | Direction mixing | English lines are now left-to-right |

**How this version was checked (new):** every page was opened in a real Chromium browser (22 cases: home, series pages with
search/filters, PDF library, reader with details and reviews, phone reader, profile tabs, login, admin gate, the other
libraries, 404). This test reproduced the exact crash from your screenshot on the old file and passes on the new one.
It uses stand-ins for packages that are not installed in the test sandbox, so the first real GitHub Actions run is still the final check.

## 0. Hotfix: "pages do not load", "an error appears", "files download by themselves"

**Root cause (reproduced in a real Chromium test):** the service worker (`public/sw.js` v1) pre-downloaded **all 39 PDFs**
(hundreds of MB) in the background on the first visit, cached every other request (including Supabase answers),
and served old copies of pages. After each new deployment an old cached page asked for script files that no longer
existed, which shows the error screen. On phones, opening a PDF inside the page also makes Android Chrome download the file.

| Fix | Detail |
|-----|--------|
| New service worker v2 | Never downloads or caches PDFs, never touches other-origin requests (PDFs, Supabase, fonts), pages are network-first, only hashed `/assets/` files are cached. On activation it deletes the old `sao-*` caches (the GBs of PDFs). Tested in Chromium: v1 auto-downloaded 39 PDFs, v2 downloads 0, old caches removed, deep links and offline mode work. |
| Built-in PDF reader for phones | `PdfCanvasViewer` (self-hosted pdf.js in `public/vendor/pdfjs`) draws the pages inside the site on Android / iPhone / iPad instead of downloading the file. Lazy page rendering, zoom, page jump, remembers the last page. Tested in Chromium (desktop, Pixel 7, iPhone 14): no downloads, no errors. Desktop keeps the browser's own viewer. (The browser's own PDF viewer is no longer used at all.) |
| Stale-file protection | Pages are lazy-loaded with a reload-once safety net when a file from an older deployment is gone. |
| Error screen | New "إصلاح وإعادة التحميل" button clears this app's service worker and caches (not other sites on the same address) and shows the technical error text. |

**After deploying:** open the site, then refresh once or twice (the new worker replaces the old one and cleans up).
If something still looks wrong, press "إصلاح وإعادة التحميل" on the error screen. Do **not** use the browser's
"clear all site data" for `mrpheonixx.github.io`: that address also hosts your academy site and would erase its data too.

---

The site is a static **GitHub Pages** app with online accounts on your existing **Supabase** project.
Method taken from the academy site (plain `fetch` to Supabase, `npm install` in the workflow, build-time guards);
no code or design was copied.

## 1. Problems found by the scan, and what was done

| # | Problem | Fix |
|---|---------|-----|
| 1 | **All icons were fake**: `favicon.png`, `apple-touch-icon.png`, `og-image.png`, `twitter-image.png` and every file in `public/icons/` were the grey placeholder SVG renamed to `.png` (installing as an app and link previews were broken) | Generated a real icon set (all sizes, maskable 512, `favicon.ico`, 1200×630 social image) and rewrote the manifest icons |
| 2 | **Invented statistics** on the home page ("+10,000 active readers" that grew randomly every 5 s, "100,000+ pages", "99.9% accuracy", "33 volumes") and in the admin panel ("+12%", "+15 new users", "2,450 views") | Replaced with real numbers computed from the catalog / database |
| 3 | **SAO and Progressive pages showed fake data**: 2 hard-coded SAO volumes with random stock photos and made-up progress; Progressive numbers changed on every refresh (`Math.random()`) | One shared `SeriesLibrary` page built from the real catalog (28 SAO + 8 Progressive volumes), with working search, arc/opened filters and sorting (search was ignored whenever a filter was active) |
| 4 | **Profile showed mock achievements, friends, analytics** (fake 1,250 pages, 7-day streak…) | Rewritten around the reader's real history: real achievements and level, reading-history list, sync with the account, clear history |
| 5 | **Library "read" buttons led to generated placeholder pages** | They open the real PDF; works without a file show "coming soon" |
| 6 | **Placeholder AdSense id** (`ca-pub-XXXX…`) loaded a broken ad script on every page | Ads are off until you set a real id (`ADSENSE_CLIENT` repository variable) |
| 7 | Social/SEO addresses hard-coded to another domain; no canonical; no `<noscript>` | `VITE_SITE_URL` (set automatically by the workflow), canonical link, noscript message |
| 8 | Everything loaded up-front (admin panel, login, readers…) | Pages are lazy-loaded; `console.log/debug/info` stripped from production builds |
| 9 | Dead weight: 2 backup pages, unused 3D/animation packages (`three`, `@react-three/*`, `framer-motion`) | Removed (faster installs) |
| 10 | Hard-coded admin password / e-mail, open PDF proxy, open CORS | Removed / restricted (earlier pass), admin is now a database row |
| 11 | Root-relative URLs (`/placeholder.svg`, `/sw.js`, `/manifest.json`…) break under a GitHub Pages sub-path | Made base-path safe everywhere; service worker caches file-by-file |
| 12 | PDF proxy needs a server (none on Pages) | PDFs are fetched straight from the content repo into a blob (`client/lib/pdfSource.ts`) |

## 2. New features
- **Accounts** (Supabase Auth): sign up / sign in / sign out / real password recovery, guest mode kept.
- **Reading history** synced between devices (newer copy wins) and **view counter** per work.
- **Admin panel**: real users list with ban/unban, real view counts, and **saved volume status**
  (published / draft = "coming soon" / hidden) that every visitor sees.
- **Ratings & comments** on every work (1–5 stars + comment, one per reader, author name set by the database, readers
  and admins can delete). Opened from the viewer's "التقييمات والتفاصيل" button.
- **Pages deploy workflow** with guards (unbuilt `index.html`, root-relative URLs, unreplaced placeholders, `service_role` key).

## 3. Setup (see DEPLOYMENT.md)
1. Supabase → SQL Editor → run the **whole** `supabase-sao.sql` (safe to re-run; adds `sao_work_status` and `sao_reviews`).
2. Authentication → URL Configuration → Redirect URLs: add `https://<user>.github.io/<repo>/login`.
3. Create your account on the site, then run the `insert into public.sao_admins …` statement at the end of the SQL file.
4. GitHub → Settings → Pages → Source: **GitHub Actions**; upload the project.
5. Optional: repository variable `ADSENSE_CLIENT` (e.g. `ca-pub-1234567890123456`) turns ads on.
6. The old admin password was committed to a public repo: treat it as compromised and change it wherever it was reused.

## 4. Verification status
- Done here: syntax check of all source files, an undefined-name scan with the TypeScript compiler, a 22-case browser test of every page; every import and named export resolves; 43 unit tests
  (Supabase client against a mocked API, PDF loader, proxy allow-list, work status, catalog filters, profile stats,
  reader routes); the catalog has no duplicate ids/urls and all 39 work ids are valid for the database.
- NOT done here (no network): `npm install`, `npm run typecheck`, `npm run build`, running the SQL on a real
  Postgres, and any browser test against the live Supabase project. The first GitHub Actions run is the real check.

## 5. Known limits / still open
- iPhone Safari shows only the first page of a PDF inside an iframe; use "open in a new tab" there.
- Hidden/draft is enforced in the PDF library, the series pages and the reader. The Side-works list and the
  Light-novels / Classic / Anime lists are still built-in lists (no PDFs yet: their buttons say "coming soon").
- The PDF files themselves stay public on GitHub: hiding a work removes it from the site, not from the repository.
- Reading history records which works were opened, not the page (the browser's PDF viewer does not expose it).
- The view counter accepts +1 from anyone (no account needed), so it can be inflated.
- Unused components still in the code (not imported anywhere): `AdSense`, `RatingFeedback`, `TTSControls`,
  `DevToolsBlocker`, `PDFSecurityLayer`, `SocialReadingHub`-style demo widgets. They contain demo data; wire or delete them later.
- `unsafe-inline` / `unsafe-eval` are still allowed by the page's CSP (needed by the inline scripts).
- "Upload new volume" in the admin panel does nothing yet (the catalog is a static file).
- Content permission: the site hosts full translated novels of a copyrighted series and shows ads (when enabled).
  Make sure you have the rights, or expect takedowns and AdSense problems.
