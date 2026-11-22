// Editing the catalog file (client/data/catalog.json) from the admin page.
// Pure functions: the admin page uses them, and they are tested without a browser.
import type { PDFWork } from "../data/pdfWorks";

export interface CatalogFile {
  version: number;
  works: PDFWork[];
}

export const ID_PATTERN = /^[A-Za-z0-9_-]{1,100}$/;
export const SAFE_FILE = /^[A-Za-z0-9._()\- ]{1,120}\.pdf$/i;

export function parseCatalog(text: string): CatalogFile {
  const data = JSON.parse(text);
  if (!data || !Array.isArray(data.works)) throw new Error("catalog.json is not valid");
  return { version: Number(data.version) || 1, works: data.works as PDFWork[] };
}

export const serializeCatalog = (c: CatalogFile): string => JSON.stringify(c, null, 2) + "\n";

/** "Sword Art Online 03" -> "sword-art-online-03" (Latin letters and digits only). */
export function slugify(input: string): string {
  const slug = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug || "work";
}

export function uniqueId(base: string, existing: Iterable<string>): string {
  const used = new Set(existing);
  if (!used.has(base)) return base;
  for (let i = 2; i < 1000; i++) if (!used.has(`${base}-${i}`)) return `${base}-${i}`;
  return `${base}-${Date.now()}`;
}

/** What the admin form collects (everything as text). */
export interface WorkFormValues {
  id: string;
  titleAr: string;
  titleEn: string;
  series: string;
  volumeNumber: string;
  arc: string;
  description: string;
  publishYear: string;
  rating: string;
  tags: string;
  file: string;
}

export function formToWork(f: WorkFormValues): PDFWork {
  const work: PDFWork = {
    id: f.id.trim(),
    file: f.file.trim(),
    series: f.series.trim(),
    titleEn: f.titleEn.trim(),
    titleAr: f.titleAr.trim(),
  };
  if (f.volumeNumber.trim()) work.volumeNumber = Number(f.volumeNumber);
  if (f.arc.trim()) work.arc = f.arc.trim();
  if (f.description.trim()) work.description = f.description.trim();
  if (f.publishYear.trim()) work.publishYear = Number(f.publishYear);
  if (f.rating.trim()) work.rating = Number(f.rating);
  const tags = f.tags.split(/[,،]/).map((t) => t.trim()).filter(Boolean);
  if (tags.length) work.tags = tags;
  return work;
}

export function workToForm(w: PDFWork): WorkFormValues {
  return {
    id: w.id,
    titleAr: w.titleAr,
    titleEn: w.titleEn,
    series: w.series,
    volumeNumber: w.volumeNumber ? String(w.volumeNumber) : "",
    arc: w.arc ?? "",
    description: w.description ?? "",
    publishYear: w.publishYear ? String(w.publishYear) : "",
    rating: w.rating !== undefined ? String(w.rating) : "",
    tags: (w.tags ?? []).join("، "),
    file: w.file,
  };
}

/** Arabic error messages; an empty list means the work can be saved. */
export function validateWork(work: PDFWork, all: PDFWork[], editingId?: string): string[] {
  const errors: string[] = [];
  const others = all.filter((w) => w.id !== editingId);
  if (!ID_PATTERN.test(work.id)) errors.push("المعرّف يجب أن يكون حروفاً إنجليزية وأرقاماً وشرطات فقط (بدون مسافات).");
  else if (others.some((w) => w.id === work.id)) errors.push("هذا المعرّف مستخدم لعمل آخر.");
  if (!work.titleAr) errors.push("العنوان بالعربية مطلوب.");
  if (!work.titleEn) errors.push("العنوان بالإنجليزية مطلوب.");
  if (!work.series) errors.push("اسم السلسلة مطلوب.");
  if (work.volumeNumber !== undefined && (!Number.isInteger(work.volumeNumber) || work.volumeNumber < 1)) errors.push("رقم المجلد يجب أن يكون رقماً صحيحاً.");
  if (work.publishYear !== undefined && (!Number.isInteger(work.publishYear) || work.publishYear < 1900 || work.publishYear > 2100)) errors.push("سنة النشر غير صحيحة.");
  if (work.rating !== undefined && (!Number.isFinite(work.rating) || work.rating < 0 || work.rating > 10)) errors.push("التقييم يجب أن يكون بين 0 و 10.");
  if (!SAFE_FILE.test(work.file)) errors.push("اسم ملف الـ PDF يجب أن ينتهي بـ .pdf ويحتوي على حروف إنجليزية وأرقام فقط.");
  else if (others.some((w) => w.file.toLowerCase() === work.file.toLowerCase())) errors.push("اسم الملف مستخدم لعمل آخر.");
  return errors;
}

export function upsertWork(c: CatalogFile, work: PDFWork, replaceId?: string): CatalogFile {
  const key = replaceId ?? work.id;
  const index = c.works.findIndex((w) => w.id === key);
  const works = [...c.works];
  if (index >= 0) works[index] = work;
  else works.push(work);
  return { ...c, works };
}

export const removeWork = (c: CatalogFile, id: string): CatalogFile => ({ ...c, works: c.works.filter((w) => w.id !== id) });
