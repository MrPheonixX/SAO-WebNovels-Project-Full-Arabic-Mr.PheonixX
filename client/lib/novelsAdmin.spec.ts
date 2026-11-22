import { describe, it, expect } from "vitest";
import { guessRepo, decodeBase64Utf8, encodeBase64Utf8, getFile } from "./github";
import { CATALOG_PATH, deleteNovel, saveNovel } from "./novelsAdmin";
import { parseCatalog } from "./catalogEdit";

const ref = { owner: "me", repo: "site", branch: "main" };
const b64 = (s: string) => encodeBase64Utf8(s);

// A tiny GitHub: files by path with a sha that changes on every write.
function fakeGithub(files: Record<string, string>, opts: { conflictOnce?: string } = {}) {
  const store = new Map<string, { sha: string; content: string }>(Object.entries(files).map(([p, c], i) => [p, { sha: "sha" + i, content: c }]));
  const log: string[] = [];
  let counter = 100;
  let conflict = opts.conflictOnce;
  (globalThis as any).fetch = async (url: string, init: any = {}) => {
    const u = new URL(url);
    const method = init.method ?? "GET";
    const m = /\/contents\/(.+)$/.exec(u.pathname);
    const path = m ? decodeURIComponent(m[1]) : "";
    log.push(`${method} ${path || u.pathname}`);
    const reply = (status: number, json: unknown) => ({ ok: status < 300, status, text: async () => JSON.stringify(json) });
    const auth = init.headers?.Authorization ?? "";
    if (!auth.startsWith("Bearer ") || auth === "Bearer ") return reply(401, { message: "Bad credentials" });
    if (!m) return reply(200, {});
    const body = init.body ? JSON.parse(init.body) : {};
    const file = store.get(path);
    if (method === "GET") return file ? reply(200, { sha: file.sha, content: file.content, encoding: "base64" }) : reply(404, { message: "Not Found" });
    if (method === "PUT") {
      if (conflict === path) { conflict = undefined; store.set(path, { sha: "sha" + counter++, content: b64(decodeBase64Utf8(file!.content).replace('"version": 1', '"version": 1')) }); }
      const current = store.get(path);
      if (current && body.sha !== current.sha) return reply(409, { message: "conflict" });
      if (!current && body.sha) return reply(422, { message: "sha not needed" });
      store.set(path, { sha: "sha" + counter++, content: body.content });
      return reply(201, { commit: { sha: "c" + counter } });
    }
    if (method === "DELETE") {
      if (!file || body.sha !== file.sha) return reply(409, { message: "conflict" });
      store.delete(path);
      return reply(200, { commit: { sha: "c" + counter++ } });
    }
    return reply(404, {});
  };
  return { store, log };
}

const catalog = (works: any[]) => JSON.stringify({ version: 1, works }, null, 2) + "\n";
const old = { id: "a", file: "A.pdf", series: "S", titleEn: "A", titleAr: "أ" };
const fresh = { id: "b", file: "B.pdf", series: "S", titleEn: "B", titleAr: "ب", volumeNumber: 2 };
const pdf = new Blob([new Uint8Array(2000)], { type: "application/pdf" });

describe("github helpers", () => {
  it("guesses the repository from the Pages address", () => {
    expect(guessRepo("me.github.io", "/site/")).toEqual({ owner: "me", repo: "site", branch: "main" });
    expect(guessRepo("me.github.io", "/")).toEqual({ owner: "me", repo: "me.github.io", branch: "main" });
    expect(guessRepo("example.com", "/")).toBe(null);
  });
  it("encodes Arabic text safely", () => {
    expect(decodeBase64Utf8(encodeBase64Utf8("روايات — Novels"))).toBe("روايات — Novels");
  });
  it("reads a missing file as null and an existing one as text", async () => {
    fakeGithub({ "x.txt": b64("hello") });
    expect((await getFile(ref, "t", "nope.txt") as any).data).toBe(null);
    expect((await getFile(ref, "t", "x.txt") as any).data.text).toBe("hello");
  });
  it("explains a bad token in Arabic", async () => {
    fakeGithub({});
    const r = await getFile(ref, "", "x");
    expect(r.ok).toBe(false);
    expect(r.ok ? "" : r.error).toBe("رمز GitHub غير صالح أو منتهي.");
  });
});

describe("saving a novel", () => {
  it("uploads the file first and the catalog last", async () => {
    const gh = fakeGithub({ [CATALOG_PATH]: b64(catalog([old])) });
    const r = await saveNovel({ ref, token: "t", work: fresh, pdf });
    expect(r.ok).toBe(true);
    const writes = gh.log.filter((l) => l.startsWith("PUT"));
    expect(writes).toEqual(["PUT books-source/B.pdf", `PUT ${CATALOG_PATH}`]);
    expect(parseCatalog(decodeBase64Utf8(gh.store.get(CATALOG_PATH)!.content)).works.map((w) => w.id)).toEqual(["a", "b"]);
    expect(gh.store.has("books-source/B.pdf")).toBe(true);
  });
  it("uploads a custom cover too", async () => {
    const gh = fakeGithub({ [CATALOG_PATH]: b64(catalog([])) });
    await saveNovel({ ref, token: "t", work: fresh, pdf, cover: { blob: new Blob([new Uint8Array(50)]), ext: "jpg" } });
    expect(gh.store.has("books-source/covers/b.jpg")).toBe(true);
  });
  it("stops before writing anything when the data is invalid", async () => {
    const gh = fakeGithub({ [CATALOG_PATH]: b64(catalog([old])) });
    const r = await saveNovel({ ref, token: "t", work: { ...fresh, id: "a" }, pdf });
    expect(r.ok).toBe(false);
    expect(gh.log.some((l) => l.startsWith("PUT"))).toBe(false);
    const noFile = await saveNovel({ ref, token: "t", work: fresh });
    expect(noFile.ok).toBe(false);
  });
  it("edits only the details when no new file is chosen", async () => {
    const gh = fakeGithub({ [CATALOG_PATH]: b64(catalog([old])) });
    const r = await saveNovel({ ref, token: "t", work: { ...old, titleEn: "Renamed" }, editingId: "a" });
    expect(r.ok).toBe(true);
    expect(gh.log.filter((l) => l.startsWith("PUT"))).toEqual([`PUT ${CATALOG_PATH}`]);
    expect(parseCatalog(decodeBase64Utf8(gh.store.get(CATALOG_PATH)!.content)).works[0].titleEn).toBe("Renamed");
  });
  it("replaces an existing PDF using its current version", async () => {
    const gh = fakeGithub({ [CATALOG_PATH]: b64(catalog([old])), "books-source/A.pdf": b64("old pdf") });
    const r = await saveNovel({ ref, token: "t", work: old, editingId: "a", pdf });
    expect(r.ok).toBe(true);
    expect(gh.store.get("books-source/A.pdf")!.content === b64("old pdf")).toBe(false);
  });
  it("retries once when the catalog changed in the meantime", async () => {
    const gh = fakeGithub({ [CATALOG_PATH]: b64(catalog([old])) }, { conflictOnce: CATALOG_PATH });
    const r = await saveNovel({ ref, token: "t", work: fresh, pdf });
    expect(r.ok).toBe(true);
    expect(gh.log.filter((l) => l === `PUT ${CATALOG_PATH}`).length).toBe(2);
  });
  it("refuses a file above GitHub's limit", async () => {
    fakeGithub({ [CATALOG_PATH]: b64(catalog([])) });
    const big = { size: 200 * 1024 * 1024 } as Blob;
    const r = await saveNovel({ ref, token: "t", work: fresh, pdf: big });
    expect(r.ok).toBe(false);
  });
});

describe("deleting a novel", () => {
  it("removes it from the catalog and, if asked, its files", async () => {
    const gh = fakeGithub({ [CATALOG_PATH]: b64(catalog([old, fresh])), "books-source/B.pdf": b64("x"), "books-source/covers/b.png": b64("y") });
    const r = await deleteNovel({ ref, token: "t", work: fresh, removeFiles: true });
    expect(r.ok).toBe(true);
    expect(parseCatalog(decodeBase64Utf8(gh.store.get(CATALOG_PATH)!.content)).works.map((w) => w.id)).toEqual(["a"]);
    expect(gh.store.has("books-source/B.pdf")).toBe(false);
    expect(gh.store.has("books-source/covers/b.png")).toBe(false);
  });
  it("keeps the files when only the catalog entry is removed", async () => {
    const gh = fakeGithub({ [CATALOG_PATH]: b64(catalog([fresh])), "books-source/B.pdf": b64("x") });
    await deleteNovel({ ref, token: "t", work: fresh, removeFiles: false });
    expect(gh.store.has("books-source/B.pdf")).toBe(true);
  });
});
