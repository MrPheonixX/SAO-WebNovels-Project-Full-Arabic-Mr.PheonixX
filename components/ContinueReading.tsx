import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import WorkCover from "@/components/WorkCover";
import { getWorkById } from "@/data/pdfWorks";
import { getBookInfo, isBookReadable, useBooksIndex } from "@/lib/books";
import { readLocalProgress } from "@/lib/cloud";

// "Continue reading": the books the reader opened most recently, with their progress.
export default function ContinueReading() {
  const navigate = useNavigate();
  useBooksIndex();
  const items = useMemo(
    () =>
      Object.entries(readLocalProgress().works)
        .sort((a, b) => Date.parse(b[1].lastOpened) - Date.parse(a[1].lastOpened))
        .map(([id, h]) => ({ work: getWorkById(id), h }))
        .filter((x) => x.work && isBookReadable(x.work.id) !== false)
        .slice(0, 3),
    [],
  );
  if (items.length === 0) return null;

  return (
    <section className="max-w-5xl mx-auto px-4 mb-12" aria-label="تابع القراءة">
      <h3 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">تابع القراءة</h3>
      <div className="grid gap-4 md:grid-cols-3">
        {items.map(({ work, h }) => {
          const info = getBookInfo(work!.id);
          const page = h.page ?? 1;
          const pct = info ? Math.min(100, Math.round((page / info.pages) * 100)) : 0;
          return (
            <button
              key={work!.id}
              type="button"
              onClick={() => navigate(`/pdf-reader/${work!.id}`)}
              className="flex gap-4 items-center text-right p-4 rounded-xl border border-blue-500/30 bg-black/40 hover:border-blue-400/70 transition"
            >
              <WorkCover work={work!} className="w-16 shrink-0" showNumber={false} />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-white truncate">{work!.titleAr}</p>
                <p className="text-xs text-gray-400 mb-2">
                  {info ? `صفحة ${page} من ${info.pages}` : `صفحة ${page}`}
                </p>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-400 to-purple-400" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
