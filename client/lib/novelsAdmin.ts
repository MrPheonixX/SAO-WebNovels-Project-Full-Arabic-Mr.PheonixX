// What the admin page does with the repository: add / edit / delete a novel.
// Order matters: the PDF is uploaded first and the catalog last, so the site never
// lists a novel whose file is not there yet.
import type { PDFWork } from "../data/pdfWorks";
import { parseCatalog, removeWork, serializeCatalog, upsertWork, validateWork, type CatalogFile } from "./catalogEdit";
import { deleteFile, encodeBase64Utf8, fileToBase64, getFile, putFile, type GhResult, type RepoRef } from "./github";

export const CATALOG_PATH = "client/data/catalog.json";
export const SOURCE_DIR = "books-source";
export const MAX_FILE_MB = 95;
const COVER_EXTENSIONS = ["png", "jpg", "jpeg", "webp"];

type Step = (message: string) => void;
const fail = (error: string): GhResult<never> => ({ ok: false, status: 0, error });

export async function fetchCatalog(ref: RepoRef, token: string): Promise<GhResult<CatalogFile>> {
  const res = await readCatalog(ref, token);
  return res.ok ? { ok: true, data: res.data.catalog } : res;
}

async function readCatalog(ref: RepoRef, token: string): Promise<GhResult<{ catalog: CatalogFile; sha: string }>> {
  const res = await getFile(ref, token, CATALOG_PATH);
  if (!res.ok) return res;
  if (!res.data) return fail("ملف الكتالوج غير موجود في المستودع.");
  try {
    return { ok: true, data: { catalog: parseCatalog(res.data.text), sha: res.data.sha } };
  } catch {
    return fail("ملف الكتالوج تالف ولا يمكن قراءته.");
  }
}

/** Writes the catalog; if somebody changed it in the meantime, applies the same change once more. */
async function writeCatalog(
  ref: RepoRef,
  token: string,
  change: (c: CatalogFile) => CatalogFile,
  message: string,
  first: { catalog: CatalogFile; sha: string },
): Promise<GhResult<CatalogFile>> {
  let current = first;
  for (let attempt = 0; attempt < 2; attempt++) {
    const next = change(current.catalog);
    const put = await putFile(ref, token, CATALOG_PATH, encodeBase64Utf8(serializeCatalog(next)), message, current.sha);
    if (put.ok) return { ok: true, data: next };
    if (put.status !== 409 && put.status !== 422) return put;
    const again = await readCatalog(ref, token);
    if (!again.ok) return again;
    current = again.data;
  }
  return fail("تعذر حفظ الكتالوج بسبب تعارض متكرر. أعد المحاولة.");
}

async function uploadFile(ref: RepoRef, token: string, path: string, blob: Blob, message: string): Promise<GhResult<null>> {
  if (blob.size > MAX_FILE_MB * 1024 * 1024) return fail(`الملف أكبر من ${MAX_FILE_MB} ميجابايت (حد GitHub).`);
  const existing = await getFile(ref, token, path);
  if (!existing.ok) return existing;
  const put = await putFile(ref, token, path, await fileToBase64(blob), message, existing.data?.sha);
  return put.ok ? { ok: true, data: null } : put;
}

export interface SaveNovelInput {
  ref: RepoRef;
  token: string;
  work: PDFWork;
  /** set when editing an existing novel */
  editingId?: string;
  pdf?: Blob;
  cover?: { blob: Blob; ext: string };
  onStep?: Step;
}

export async function saveNovel({ ref, token, work, editingId, pdf, cover, onStep = () => {} }: SaveNovelInput): Promise<GhResult<CatalogFile>> {
  onStep("قراءة الكتالوج من المستودع…");
  const first = await readCatalog(ref, token);
  if (!first.ok) return first;

  const errors = validateWork(work, first.data.catalog.works, editingId);
  if (errors.length) return fail(errors.join(" "));
  if (!editingId && !pdf) return fail("اختر ملف الـ PDF للرواية الجديدة.");

  if (pdf) {
    onStep(`رفع ملف الرواية (${(pdf.size / 1024 / 1024).toFixed(1)} ميجابايت)…`);
    const up = await uploadFile(ref, token, `${SOURCE_DIR}/${work.file}`, pdf, `Add novel file: ${work.file}`);
    if (!up.ok) return up;
  }
  if (cover) {
    if (!COVER_EXTENSIONS.includes(cover.ext)) return fail("صيغة الغلاف يجب أن تكون png أو jpg أو webp.");
    onStep("رفع الغلاف…");
    const up = await uploadFile(ref, token, `${SOURCE_DIR}/covers/${work.id}.${cover.ext}`, cover.blob, `Cover: ${work.id}`);
    if (!up.ok) return up;
  }

  onStep("حفظ بيانات الرواية في الكتالوج…");
  return writeCatalog(ref, token, (c) => upsertWork(c, work, editingId), `${editingId ? "Edit" : "Add"} novel: ${work.id}`, first.data);
}

export async function deleteNovel(input: { ref: RepoRef; token: string; work: PDFWork; removeFiles: boolean; onStep?: Step }): Promise<GhResult<CatalogFile>> {
  const { ref, token, work, removeFiles, onStep = () => {} } = input;
  onStep("حذف الرواية من الكتالوج…");
  const first = await readCatalog(ref, token);
  if (!first.ok) return first;
  const written = await writeCatalog(ref, token, (c) => removeWork(c, work.id), `Remove novel: ${work.id}`, first.data);
  if (!written.ok || !removeFiles) return written;

  const paths = [`${SOURCE_DIR}/${work.file}`, ...COVER_EXTENSIONS.map((e) => `${SOURCE_DIR}/covers/${work.id}.${e}`)];
  for (const path of paths) {
    onStep(`حذف ${path}…`);
    const existing = await getFile(ref, token, path);
    if (existing.ok && existing.data) {
      const del = await deleteFile(ref, token, path, `Remove file: ${path}`, existing.data.sha);
      if (!del.ok) return del;
    }
  }
  return written;
}
