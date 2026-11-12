import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Play, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { readLocalProgress } from "@/lib/cloud";
import {
  filterAndSort,
  seriesArcs,
  seriesVolumes,
  type LibraryFilter,
  type LibrarySort,
} from "@/lib/catalogView";
import { getWorkStatus, useWorkStatuses } from "@/lib/workStatus";

// Tailwind needs complete class names, so every theme spells them out.
const THEMES = {
  blue: {
    page: "from-slate-900 via-blue-900 to-violet-900",
    header: "border-blue-500/20",
    title: "from-blue-400 to-purple-400",
    sub: "text-blue-300",
    card: "border-blue-500/30 hover:border-blue-400/60",
    accent: "text-blue-400",
    badge: "bg-blue-500/20 text-blue-300 border-blue-400/50",
    field: "border-blue-500/30 focus:border-blue-400",
    button: "from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500",
  },
  violet: {
    page: "from-slate-900 via-violet-900 to-pink-900",
    header: "border-violet-500/20",
    title: "from-violet-400 to-pink-400",
    sub: "text-violet-300",
    card: "border-violet-500/30 hover:border-violet-400/60",
    accent: "text-violet-400",
    badge: "bg-violet-500/20 text-violet-300 border-violet-400/50",
    field: "border-violet-500/30 focus:border-violet-400",
    button: "from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500",
  },
} as const;

interface SeriesLibraryProps {
  /** exact `series` value used in client/data/pdfWorks.ts */
  series: string;
  title: string;
  subtitle: string;
  theme: keyof typeof THEMES;
}

export default function SeriesLibrary({ series, title, subtitle, theme }: SeriesLibraryProps) {
  const navigate = useNavigate();
  const t = THEMES[theme];
  const statusVersion = useWorkStatuses(); // re-render when the admin hides/unhides a work

  const [query, setQuery] = useState("");
  const [arc, setArc] = useState("all");
  const [filter, setFilter] = useState<LibraryFilter>("all");
  const [sort, setSort] = useState<LibrarySort>("order");

  const all = useMemo(() => seriesVolumes(series), [series]);
  const arcs = useMemo(() => seriesArcs(all), [all]);
  const history = useMemo(() => readLocalProgress().works, []);
  const opened = useMemo(() => new Set(Object.keys(history)), [history]);

  const volumes = useMemo(
    () =>
      filterAndSort(all, {
        query,
        arc,
        filter,
        sort,
        opened,
        isHidden: (id) => getWorkStatus(id) === "hidden",
      }),
    [all, query, arc, filter, sort, opened, statusVersion],
  );

  const field = `px-4 py-2 bg-black/40 border ${t.field} rounded-lg text-white placeholder-gray-400 focus:outline-none`;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${t.page} text-white`}>
      <header className={`border-b ${t.header} bg-black/20 backdrop-blur-sm`}>
        <div className="container mx-auto px-4 py-6 flex items-center justify-between gap-4">
          <Button variant="outline" onClick={() => navigate("/")} className="border-gray-500 text-gray-200">
            <ArrowLeft className="w-4 h-4 mr-2" />
            العودة
          </Button>
          <div className="text-center">
            <h1 className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${t.title} bg-clip-text text-transparent`}>
              {title}
            </h1>
            <p className={`${t.sub} mt-2`}>{subtitle}</p>
          </div>
          <Badge className={t.badge}>{all.length} مجلد</Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <input
            type="search"
            aria-label="ابحث في المجلدات"
            placeholder="ابحث في المجلدات..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`${field} md:w-80`}
          />
          <div className="flex flex-wrap gap-3">
            {arcs.length > 1 && (
              <select aria-label="القوس القصصي" value={arc} onChange={(e) => setArc(e.target.value)} className={field}>
                <option value="all">كل الأقواس</option>
                {arcs.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            )}
            <select aria-label="التصفية" value={filter} onChange={(e) => setFilter(e.target.value as LibraryFilter)} className={field}>
              <option value="all">الكل</option>
              <option value="opened">فتحته من قبل</option>
              <option value="unread">لم أفتحه بعد</option>
            </select>
            <select aria-label="الترتيب" value={sort} onChange={(e) => setSort(e.target.value as LibrarySort)} className={field}>
              <option value="order">ترتيب السلسلة</option>
              <option value="rating">الأعلى تقييماً</option>
              <option value="pages">الأكثر صفحات</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {volumes.map((work) => {
            const draft = getWorkStatus(work.id) === "draft";
            const last = history[work.id]?.lastOpened;
            const open = () => !draft && navigate(`/pdf-reader/${work.id}`);
            return (
              <article
                key={work.id}
                role="link"
                tabIndex={draft ? -1 : 0}
                aria-disabled={draft}
                onClick={open}
                onKeyDown={(e) => e.key === "Enter" && open()}
                className={`group overflow-hidden rounded-xl border ${t.card} bg-gray-900/60 backdrop-blur-xl transition-all duration-300 ${draft ? "opacity-70" : "cursor-pointer hover:-translate-y-1"}`}
              >
                <div className={`h-24 bg-gradient-to-br ${work.coverColor ?? "from-slate-700 to-slate-900"} flex items-center justify-between px-5`}>
                  <span className="text-5xl font-black text-white/80">
                    {work.volumeNumber ? String(work.volumeNumber).padStart(2, "0") : "★"}
                  </span>
                  {work.arc && <Badge className="bg-black/30 text-white border-white/30">{work.arc}</Badge>}
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <h3 className={`text-lg font-bold ${t.accent} leading-snug`}>{work.titleAr}</h3>
                    <p className="text-gray-400 text-xs mt-1" dir="ltr">
                      {work.titleEn}
                    </p>
                  </div>

                  {work.description && <p className="text-gray-300 text-sm leading-relaxed">{work.description}</p>}

                  {work.tags && (
                    <div className="flex flex-wrap gap-2">
                      {work.tags.slice(0, 4).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div>
                      <div className={`${t.accent} font-semibold`}>{work.pages ?? "—"}</div>
                      <div className="text-gray-400">صفحة</div>
                    </div>
                    <div>
                      <div className="text-yellow-400 font-semibold flex items-center justify-center gap-1">
                        <Star className="w-3.5 h-3.5" />
                        {work.rating ?? "—"}
                      </div>
                      <div className="text-gray-400">التقييم</div>
                    </div>
                    <div>
                      <div className="text-green-400 font-semibold">{work.publishYear ?? "—"}</div>
                      <div className="text-gray-400">السنة</div>
                    </div>
                  </div>

                  {last && (
                    <p className="text-xs text-gray-400">
                      آخر فتح: {new Date(last).toLocaleDateString("ar-EG")}
                    </p>
                  )}

                  {draft ? (
                    <Button disabled variant="outline" className="w-full">
                      قريباً
                    </Button>
                  ) : (
                    <Button
                      className={`w-full bg-gradient-to-r ${t.button}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        open();
                      }}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {last ? "متابعة القراءة" : "ابدأ القراءة"}
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {volumes.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">لا توجد مجلدات</h3>
            <p className="text-gray-500">حاول تغيير البحث أو التصفية</p>
          </div>
        )}
      </main>
    </div>
  );
}
