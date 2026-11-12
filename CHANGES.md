# CHANGES — full scan, fixes and new features (Nov 2026)

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
- Done here: syntax check of all 129 source files; every import and named export resolves; 43 unit tests
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
