The novels (PDF files) of the site.

The site first looks for each book HERE (books/<file name>.pdf) and only if it is
missing there does it fall back to the external content repository.

You do not have to put them here by hand: the deploy workflow
(.github/workflows/pages.yml) copies every PDF of the content repository
(MrPheonixX/My-Works-PDF- by default, or the repository variable CONTENT_REPO)
into the published site's books/ folder, and keeps any file you commit here.

Limits to remember:
  * GitHub Pages publishes at most 1 GB in total (the deploy stops with a message above ~950 MB).
  * The GitHub website accepts uploads up to 25 MB per file; larger files need git.
File names must match the ones in client/data/pdfWorks.ts (pdfUrlRaw).
