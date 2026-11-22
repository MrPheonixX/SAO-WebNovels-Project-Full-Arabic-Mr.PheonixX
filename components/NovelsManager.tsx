import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WorkCover from "@/components/WorkCover";
import { pdfWorks, type PDFWork } from "@/data/pdfWorks";
import { isBookReadable, useBooksIndex, getBookInfo } from "@/lib/books";
import { formToWork, slugify, uniqueId, workToForm, type WorkFormValues } from "@/lib/catalogEdit";
import {
  dispatchDeploy,
  getRepoRef,
  getToken,
  latestRun,
  saveRepoRef,
  saveToken,
  testAccess,
  type DeployRun,
  type RepoRef,
} from "@/lib/github";
import { deleteNovel, fetchCatalog, saveNovel } from "@/lib/novelsAdmin";

const EMPTY: WorkFormValues = {
  id: "",
  titleAr: "",
  titleEn: "",
  series: "",
  volumeNumber: "",
  arc: "",
  description: "",
  publishYear: "",
  rating: "",
  tags: "",
  file: "",
};

const input = "w-full px-3 py-2 bg-black/40 border border-gray-500/30 rounded-md text-white placeholder-gray-500 focus:border-purple-400 focus:outline-none";
const label = "block text-sm text-gray-300 mb-1";

const cleanName = (name: string) => name.replace(/[^A-Za-z0-9._()\- ]/g, "_").replace(/\s+/g, "_");

// Add, edit and delete novels from the admin page. Everything is committed to THIS
// repository (the PDF in books-source/, the details in client/data/catalog.json) and
// the site rebuilds itself; there is no other storage.
export default function NovelsManager() {
  useBooksIndex();
  const [token, setToken] = useState(getToken());
  const [repo, setRepo] = useState<RepoRef>(() => getRepoRef() ?? { owner: "", repo: "", branch: "main" });
  const [conn, setConn] = useState<{ state: "idle" | "checking" | "ok" | "bad"; text: string }>({ state: "idle", text: "" });
  const [works, setWorks] = useState<PDFWork[]>(pdfWorks);
  const [form, setForm] = useState<{ values: WorkFormValues; editingId?: string } | null>(null);
  const [pdf, setPdf] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [steps, setSteps] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [run, setRun] = useState<DeployRun | null>(null);
  const [watching, setWatching] = useState(false);

  const connected = conn.state === "ok";
  const seriesList = useMemo(() => [...new Set(works.map((w) => w.series))], [works]);
  const ready = token.trim() !== "" && repo.owner !== "" && repo.repo !== "";

  const connect = async () => {
    setConn({ state: "checking", text: "جاري الاختبار…" });
    saveToken(token.trim());
    saveRepoRef(repo);
    const r = await testAccess(repo, token.trim());
    if (!r.ok) return setConn({ state: "bad", text: r.error });
    if (r.data.permissions && r.data.permissions.push === false) return setConn({ state: "bad", text: "الرمز يقرأ المستودع فقط. فعّل Contents: Read and write." });
    setConn({ state: "ok", text: `متصل بالمستودع ${r.data.full_name}` });
    const cat = await fetchCatalog(repo, token.trim());
    if (cat.ok) setWorks(cat.data.works);
  };

  const refreshRun = async () => {
    const r = await latestRun(repo, token.trim());
    if (r.ok) {
      setRun(r.data);
      if (r.data && r.data.status === "completed") setWatching(false);
    }
  };
  useEffect(() => {
    if (!watching) return;
    void refreshRun();
    const t = setInterval(() => void refreshRun(), 15000);
    const stop = setTimeout(() => setWatching(false), 30 * 60 * 1000);
    return () => {
      clearInterval(t);
      clearTimeout(stop);
    };
  }, [watching]); // eslint-disable-line react-hooks/exhaustive-deps

  const startAdd = () => {
    setForm({ values: { ...EMPTY } });
    setPdf(null);
    setCover(null);
    setError("");
    setDone("");
    setSteps([]);
  };
  const startEdit = (w: PDFWork) => {
    setForm({ values: workToForm(w), editingId: w.id });
    setPdf(null);
    setCover(null);
    setError("");
    setDone("");
    setSteps([]);
  };
  const set = (patch: Partial<WorkFormValues>) => setForm((f) => (f ? { ...f, values: { ...f.values, ...patch } } : f));

  const onPickPdf = (file: File | null) => {
    setPdf(file);
    if (file && form && !form.editingId) {
      const name = cleanName(file.name);
      set({ file: form.values.file || name, id: form.values.id || uniqueId(slugify(name.replace(/\.pdf$/i, "")), works.map((w) => w.id)) });
    }
  };

  const submit = async () => {
    if (!form) return;
    setBusy(true);
    setError("");
    setDone("");
    setSteps([]);
    const v = { ...form.values };
    if (!form.editingId) {
      if (!v.id.trim()) v.id = uniqueId(slugify(v.titleEn || v.file.replace(/\.pdf$/i, "")), works.map((w) => w.id));
      if (!v.file.trim() && pdf) v.file = cleanName(pdf.name);
    }
    if (v.file && !/\.pdf$/i.test(v.file)) v.file += ".pdf";
    const ext = cover?.name.split(".").pop()?.toLowerCase() ?? "";
    const result = await saveNovel({
      ref: repo,
      token: token.trim(),
      work: formToWork(v),
      editingId: form.editingId,
      pdf: pdf ?? undefined,
      cover: cover ? { blob: cover, ext: ext === "jpeg" ? "jpg" : ext } : undefined,
      onStep: (m) => setSteps((s) => [...s, m]),
    });
    setBusy(false);
    if (!result.ok) return setError(result.error);
    setWorks(result.data.works);
    setForm(null);
    setDone("تم الحفظ في المستودع. الموقع يعيد البناء الآن وستظهر الرواية خلال بضع دقائق (أول معالجة لكتاب كبير قد تأخذ أطول).");
    setWatching(true);
  };

  const remove = async (w: PDFWork) => {
    if (!window.confirm(`حذف "${w.titleAr}" من الكتالوج؟`)) return;
    const removeFiles = window.confirm("هل تريد حذف ملف الـ PDF والغلاف من المستودع أيضاً؟\n(موافق = احذفهما، إلغاء = أبقِ الملفات)");
    setBusy(true);
    setError("");
    setDone("");
    setSteps([]);
    const result = await deleteNovel({ ref: repo, token: token.trim(), work: w, removeFiles, onStep: (m) => setSteps((s) => [...s, m]) });
    setBusy(false);
    if (!result.ok) return setError(result.error);
    setWorks(result.data.works);
    setDone("تم الحذف. الموقع يعيد البناء الآن.");
    setWatching(true);
  };

  const deployNow = async () => {
    const r = await dispatchDeploy(repo, token.trim());
    if (r.ok) {
      setDone("بدأ نشر جديد.");
      setWatching(true);
    } else setError(r.error);
  };

  const runText = run ? (run.status === "completed" ? (run.conclusion === "success" ? "اكتمل النشر بنجاح ✅" : `انتهى النشر بنتيجة: ${run.conclusion}`) : run.status === "queued" ? "في الانتظار…" : "جاري البناء…") : "";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-purple-400">الروايات</h2>
        <Button className="bg-gradient-to-r from-green-600 to-blue-600" onClick={startAdd} disabled={!connected}>
          + إضافة رواية
        </Button>
      </div>

      <Card className="bg-black/40 border-purple-500/30 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-lg text-purple-300">الاتصال بالمستودع</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-400 leading-relaxed">
            الرفع والتعديل يتمّان بحفظ الملفات داخل ريبو الموقع نفسه. أنشئ رمزاً من GitHub ← Settings ← Developer settings ← Fine-grained tokens، وحدّد هذا المستودع فقط، وفعّل
            <b className="text-gray-200"> Contents: Read and write </b> و<b className="text-gray-200">Actions: Read and write</b>. يُحفظ الرمز في هذا المتصفح فقط.
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className={label}>اسم الحساب (owner)</label>
              <input className={input} dir="ltr" value={repo.owner} onChange={(e) => setRepo({ ...repo, owner: e.target.value.trim() })} />
            </div>
            <div>
              <label className={label}>اسم المستودع (repo)</label>
              <input className={input} dir="ltr" value={repo.repo} onChange={(e) => setRepo({ ...repo, repo: e.target.value.trim() })} />
            </div>
            <div>
              <label className={label}>الفرع</label>
              <input className={input} dir="ltr" value={repo.branch} onChange={(e) => setRepo({ ...repo, branch: e.target.value.trim() || "main" })} />
            </div>
          </div>
          <div>
            <label className={label}>رمز GitHub</label>
            <input className={input} dir="ltr" type="password" autoComplete="off" placeholder="github_pat_…" value={token} onChange={(e) => setToken(e.target.value)} />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button onClick={connect} disabled={!ready || conn.state === "checking"}>
              حفظ واختبار الاتصال
            </Button>
            {conn.text && <span className={`text-sm ${conn.state === "ok" ? "text-green-400" : conn.state === "bad" ? "text-red-400" : "text-gray-300"}`}>{conn.text}</span>}
          </div>
        </CardContent>
      </Card>

      {(error || done || busy || steps.length > 0) && (
        <Card className="bg-black/40 border-blue-500/30">
          <CardContent className="p-4 space-y-1 text-sm">
            {steps.map((s, i) => (
              <p key={i} className="text-gray-300">
                • {s}
              </p>
            ))}
            {busy && <p className="text-blue-300">جاري التنفيذ… لا تغلق الصفحة.</p>}
            {error && (
              <p className="text-red-400" role="alert">
                {error}
              </p>
            )}
            {done && <p className="text-green-400">{done}</p>}
            {runText && (
              <p className="text-gray-200">
                حالة النشر: {runText}{" "}
                {run && (
                  <a className="text-blue-400 underline" href={run.url} target="_blank" rel="noreferrer">
                    التفاصيل
                  </a>
                )}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {form && (
        <Card className="bg-black/40 border-green-500/30 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-lg text-green-300">{form.editingId ? "تعديل رواية" : "رواية جديدة"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className={label}>العنوان بالعربية *</label>
                <input className={input} value={form.values.titleAr} onChange={(e) => set({ titleAr: e.target.value })} />
              </div>
              <div>
                <label className={label}>العنوان بالإنجليزية *</label>
                <input className={input} dir="ltr" value={form.values.titleEn} onChange={(e) => set({ titleEn: e.target.value })} />
              </div>
              <div>
                <label className={label}>السلسلة *</label>
                <input className={input} list="series-list" value={form.values.series} onChange={(e) => set({ series: e.target.value })} />
                <datalist id="series-list">
                  {seriesList.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className={label}>رقم المجلد</label>
                <input className={input} dir="ltr" inputMode="numeric" value={form.values.volumeNumber} onChange={(e) => set({ volumeNumber: e.target.value })} />
              </div>
              <div>
                <label className={label}>القوس القصصي</label>
                <input className={input} value={form.values.arc} onChange={(e) => set({ arc: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={label}>سنة النشر</label>
                  <input className={input} dir="ltr" inputMode="numeric" value={form.values.publishYear} onChange={(e) => set({ publishYear: e.target.value })} />
                </div>
                <div>
                  <label className={label}>التقييم (0-10)</label>
                  <input className={input} dir="ltr" inputMode="decimal" value={form.values.rating} onChange={(e) => set({ rating: e.target.value })} />
                </div>
              </div>
            </div>
            <div>
              <label className={label}>الوصف</label>
              <textarea className={input} rows={3} value={form.values.description} onChange={(e) => set({ description: e.target.value })} />
            </div>
            <div>
              <label className={label}>التصنيفات (افصل بفاصلة)</label>
              <input className={input} value={form.values.tags} onChange={(e) => set({ tags: e.target.value })} />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className={label}>
                  ملف الرواية (PDF) {form.editingId ? "— اتركه فارغاً للإبقاء على الملف الحالي" : "*"}
                </label>
                <input className={input} type="file" accept="application/pdf,.pdf" onChange={(e) => onPickPdf(e.target.files?.[0] ?? null)} />
                {pdf && <p className="text-xs text-gray-400 mt-1">{(pdf.size / 1024 / 1024).toFixed(1)} ميجابايت</p>}
              </div>
              <div>
                <label className={label}>غلاف مخصص (اختياري، وإلا تُستخدم أول صفحة)</label>
                <input className={input} type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setCover(e.target.files?.[0] ?? null)} />
              </div>
            </div>
            {!form.editingId && (
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className={label}>المعرّف (يُنشأ تلقائياً)</label>
                  <input className={input} dir="ltr" value={form.values.id} onChange={(e) => set({ id: e.target.value })} />
                </div>
                <div>
                  <label className={label}>اسم الملف في المستودع</label>
                  <input className={input} dir="ltr" value={form.values.file} onChange={(e) => set({ file: e.target.value })} />
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <Button onClick={submit} disabled={busy} className="bg-gradient-to-r from-green-600 to-blue-600">
                {busy ? "جاري الحفظ…" : "حفظ في المستودع"}
              </Button>
              <Button variant="outline" onClick={() => setForm(null)} disabled={busy}>
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3">
        {works.map((w) => {
          const readable = isBookReadable(w.id);
          const info = getBookInfo(w.id);
          return (
            <Card key={w.id} className="bg-black/40 border-purple-500/20">
              <CardContent className="p-3 flex items-center gap-4">
                <WorkCover work={w} className="w-12 shrink-0" showNumber={false} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{w.titleAr}</p>
                  <p className="text-xs text-gray-400 truncate" dir="ltr">
                    {w.titleEn} · {w.file}
                  </p>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {w.series}
                      {w.volumeNumber ? ` · ${w.volumeNumber}` : ""}
                    </Badge>
                    {readable === true && <Badge className="bg-green-500/20 text-green-300 text-xs">جاهزة · {info?.pages} صفحة</Badge>}
                    {readable === false && <Badge className="bg-yellow-500/20 text-yellow-300 text-xs">بانتظار الملف أو المعالجة</Badge>}
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => startEdit(w)} disabled={!connected || busy}>
                  تعديل
                </Button>
                <Button size="sm" variant="outline" onClick={() => remove(w)} disabled={!connected || busy} className="border-red-500/40 text-red-400">
                  حذف
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-3 flex-wrap">
        <Button variant="outline" onClick={deployNow} disabled={!connected || busy}>
          نشر الآن
        </Button>
        <Button variant="outline" onClick={() => void refreshRun()} disabled={!connected}>
          تحديث حالة النشر
        </Button>
      </div>
    </div>
  );
}
