Put the novels (PDF files) here.

  books-source/<file name>.pdf        the novel (the name must match "file" in client/data/catalog.json)
  books-source/covers/<work id>.jpg   optional: your own cover (jpg, png or webp); otherwise page 1 is the cover

On every deploy, GitHub Actions turns each PDF into page images, thumbnails, a cover and the text
(scripts/render-books.mjs). The PDF files themselves are NEVER published on the website, so readers
can only read them inside the site.

You can add, edit and remove novels from the admin page (it commits to this folder and to
client/data/catalog.json for you), or upload files here by hand and edit catalog.json.
Limits: the GitHub website accepts files up to 25 MB; the admin page and git accept up to 100 MB.
