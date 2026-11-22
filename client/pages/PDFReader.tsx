import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertCircle, ArrowLeft, BookOpen, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Reader from "@/components/reader/Reader";
import WorkCover from "@/components/WorkCover";
import WorkReviews from "@/components/WorkReviews";
import { getWorkById } from "@/data/pdfWorks";
import { getBookInfo, isBookReadable, useBooksIndex } from "@/lib/books";
import { getBookState, noteWorkOpened, readLocalProgress, recordWorkView } from "@/lib/cloud";
import { getWorkStatus, useWorkStatuses } from "@/lib/workStatus";

const Message: React.FC<{ title: string; text: string; onBack: () => void; busy?: boolean }> = ({ title, text, onBack, busy }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
    <Card className="w-full max-w-md bg-black/40 backdrop-blur-xl border border-cyan-500/30">
      <CardContent className="p-8 text-center">
        {busy ? <div className="animate-spin w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4" /> : <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />}
        <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
        <p className="text-gray-300 mb-6">{text}</p>
        <Button onClick={onBack} variant="outline" className="border-cyan-500/40 text-cyan-300">
          <ArrowLeft className="w-4 h-4 ml-2" />
          العودة للمكتبة
        </Button>
      </CardContent>
    </Card>
  </div>
);

const PDFReader: React.FC = () => {
  const { workId } = useParams<{ workId: string }>();
  const navigate = useNavigate();
  const statusVersion = useWorkStatuses();
  useBooksIndex();
  const [showReader, setShowReader] = useState(true);
  const [waited, setWaited] = useState(false);
  const notedRef = useRef<string | null>(null);

  const work = workId ? getWorkById(workId) : undefined;
  const info = work ? getBookInfo(work.id) : undefined;
  const readable = work ? isBookReadable(work.id) : null;
  const visibility = work ? getWorkStatus(work.id) : "published";

  const backToLibrary = () => (window.history.length > 1 ? navigate(-1) : navigate("/pdf-works"));

  // the books list normally arrives in a moment; do not wait for it forever
  useEffect(() => {
    const t = setTimeout(() => setWaited(true), 7000);
    return () => clearTimeout(t);
  }, []);

  // count the visit once, when the book can really be read
  useEffect(() => {
    if (!work || readable !== true || visibility !== "published") return;
    if (notedRef.current === work.id) return;
    notedRef.current = work.id;
    noteWorkOpened(work.id);
    void recordWorkView(work.id);
  }, [work, readable, visibility, statusVersion]);

  if (!work) return <Message title="العمل غير موجود" text="لم نجد هذا العمل في المكتبة." onBack={backToLibrary} />;
  if (visibility === "draft") return <Message title="قريباً" text="هذا العمل سيتوفر قريباً." onBack={backToLibrary} />;
  if (visibility === "hidden") return <Message title="غير متاح" text="هذا العمل غير متاح حالياً." onBack={backToLibrary} />;
  if (readable === null) {
    return waited ? (
      <Message title="تعذر تحميل الكتب" text="تأكد من اتصالك بالإنترنت ثم أعد تحميل الصفحة." onBack={backToLibrary} />
    ) : (
      <Message title="جاري التحضير…" text="نجهّز الكتاب للقراءة." onBack={backToLibrary} busy />
    );
  }
  if (readable === false || !info) {
    return <Message title="قريباً" text="لم يُرفع ملف هذا العمل بعد. سيظهر هنا فور إضافته." onBack={backToLibrary} />;
  }

  if (showReader) {
    return (
      <Reader
        id={work.id}
        title={work.titleAr}
        subtitle={[work.series, work.volumeNumber ? `المجلد ${work.volumeNumber}` : ""].filter(Boolean).join(" · ")}
        info={info}
        onClose={backToLibrary}
        onShowInfo={() => setShowReader(false)}
      />
    );
  }

  const state = getBookState(work.id);
  const last = readLocalProgress().works[work.id]?.lastOpened;
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: work.titleAr, url });
      else await navigator.clipboard.writeText(url);
    } catch {
      /* cancelled */
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={backToLibrary} className="text-white hover:text-cyan-400 mb-4">
          <ArrowLeft className="w-4 h-4 ml-2" />
          العودة للمكتبة
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-black/40 backdrop-blur-xl border border-cyan-500/30">
              <CardHeader>
                <div className="flex gap-5 items-start">
                  <WorkCover work={work} className="w-32 sm:w-40 shrink-0" rounded="rounded-lg" />
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-2xl font-bold text-white mb-2">{work.titleAr}</CardTitle>
                    <p className="text-gray-400 text-lg mb-4" dir="ltr">
                      {work.titleEn}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                        {work.series}
                      </Badge>
                      {work.volumeNumber && (
                        <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                          المجلد {work.volumeNumber}
                        </Badge>
                      )}
                      {work.arc && (
                        <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                          {work.arc}
                        </Badge>
                      )}
                      {work.rating !== undefined && (
                        <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                          {work.rating}/10
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {work.description && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-3">وصف العمل</h3>
                    <p className="text-gray-300 leading-relaxed">{work.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-gray-400 text-sm">سنة النشر</p>
                    <p className="text-white font-semibold">{work.publishYear || "غير محدد"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">عدد الصفحات</p>
                    <p className="text-white font-semibold">{info.pages} صفحة</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">الحالة</p>
                    <p className="text-white font-semibold">متاح للقراءة</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">التقدم</p>
                    <p className="text-white font-semibold">{Math.round((Math.min(state.page, info.pages) / info.pages) * 100)}%</p>
                  </div>
                </div>

                {work.tags && work.tags.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-3">التصنيفات</h3>
                    <div className="flex flex-wrap gap-2">
                      {work.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="border-gray-500/30 text-gray-300">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => setShowReader(true)} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white">
                    <BookOpen className="w-4 h-4 ml-2" />
                    {state.page > 1 ? `متابعة القراءة (صفحة ${state.page})` : "بدء القراءة"}
                  </Button>
                  <Button variant="outline" onClick={share} className="border-gray-500/30 text-gray-300 hover:bg-gray-500/10">
                    <Share2 className="w-4 h-4 ml-2" />
                    مشاركة
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-black/40 backdrop-blur-xl border border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-lg text-white">إحصائيات القراءة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">الصفحة الحالية</span>
                    <span className="text-white font-semibold">{state.page}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">آخر قراءة</span>
                    <span className="text-white font-semibold">{last ? new Date(last).toLocaleDateString("ar-EG-u-nu-latn") : "لم تبدأ بعد"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">الإشارات</span>
                    <span className="text-white font-semibold">{state.bookmarks.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-900/20 border border-red-500/30">
              <CardContent className="p-5 space-y-2 text-sm text-red-300">
                <p>📖 القراءة داخل الموقع فقط</p>
                <p>📜 المحتوى محمي بحقوق الطبع والنشر</p>
              </CardContent>
            </Card>

            <WorkReviews workId={work.id} />

            <Card className="bg-black/40 backdrop-blur-xl border border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-lg text-purple-400">معلومات الترجمة</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm">المترجم</p>
                <p className="text-white font-semibold">MrPheonixX Team</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFReader;
