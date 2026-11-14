import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  BookOpen,
  Star,
  Clock,
  Download,
  Filter,
  Grid3X3,
  List,
  ArrowLeft,
  Zap,
  Eye,
  Calendar,
} from "lucide-react";
import {
  pdfWorks,
  getSeriesList,
  getArcsList,
  searchWorks,
  getStatistics,
  PDFWork,
} from "@/data/pdfWorks";
import { getWorkStatus, useWorkStatuses } from "@/lib/workStatus";
import AuthButton from "@/components/AuthButton";
import PDFCover from "@/components/PDFCover";

const PDFWorksLibrary: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeries, setSelectedSeries] = useState("all");
  const [selectedArc, setSelectedArc] = useState("all");
  const [sortBy, setSortBy] = useState<"title" | "rating" | "year" | "pages">(
    "title",
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  // re-render when the admin hides/unhides a work
  const statusVersion = useWorkStatuses();

  // Initialize filters from URL (?series=...&arc=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get("series");
    const a = params.get("arc");
    const seriesList = getSeriesList();
    const arcsList = getArcsList();
    if (s && seriesList.includes(s)) setSelectedSeries(s);
    if (a && arcsList.includes(a)) setSelectedArc(a);
  }, []);

  const seriesList = getSeriesList();
  const arcsList = getArcsList();
  const stats = getStatistics();

  const filteredWorks = useMemo(() => {
    // works the admin hid are not listed (this also copies the array before sorting)
    let filtered = (searchQuery ? searchWorks(searchQuery) : pdfWorks).filter(
      (work) => getWorkStatus(work.id) !== "hidden",
    );

    if (selectedSeries !== "all") {
      filtered = filtered.filter((work) => work.series === selectedSeries);
    }

    if (selectedArc !== "all") {
      filtered = filtered.filter((work) => work.arc === selectedArc);
    }

    // ترتيب النتائج
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "year":
          return (b.publishYear || 0) - (a.publishYear || 0);
        case "pages":
          return (b.pages || 0) - (a.pages || 0);
        default:
          return a.titleAr.localeCompare(b.titleAr, "ar");
      }
    });

    return filtered;
  }, [searchQuery, selectedSeries, selectedArc, sortBy, statusVersion]);

  const paginatedWorks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredWorks.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredWorks, currentPage]);

  const totalPages = Math.ceil(filteredWorks.length / itemsPerPage);

  const handleReadWork = (work: PDFWork) => {
    navigate(`/pdf-reader/${work.id}`);
  };

  const handleDownloadAttempt = () => {
    alert("🚫 التحميل غير مسموح - المحتوى محمي بحقوق الطبع والنشر");
  };

  const getSeriesColor = (series: string) => {
    switch (series) {
      case "Sword Art Online":
        return "from-blue-500 to-cyan-500";
      case "Sword Art Online Progressive":
        return "from-cyan-500 to-blue-500";
      case "Welcome to the NHK":
        return "from-purple-500 to-blue-500";
      case "Other":
        return "from-gray-500 to-gray-700";
      default:
        return "from-indigo-500 to-purple-500";
    }
  };

  const WorkCard: React.FC<{ work: PDFWork }> = ({ work }) => (
    <Card className="group bg-black/40 backdrop-blur-xl border border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20">
      <div
        className={`h-2 bg-gradient-to-r ${work.coverColor || getSeriesColor(work.series)} rounded-t-lg`}
      />
      <div className="px-4 pt-4">
        <PDFCover
          pdfUrl={work.pdfUrlRaw}
          fallbackGradient={work.coverColor || getSeriesColor(work.series)}
          backgroundImage={work.backgroundImage}
        />
      </div>
      <CardHeader className="pb-3 pt-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
              {work.titleAr}
            </CardTitle>
            <p className="text-gray-400 text-sm mt-1 line-clamp-1">
              {work.titleEn}
            </p>
          </div>
          <Badge
            variant="secondary"
            className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs"
          >
            {work.rating}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-1 mt-2">
          <Badge
            variant="outline"
            className="text-xs border-cyan-500/30 text-cyan-400"
          >
            {work.series}
          </Badge>
          {work.volumeNumber && (
            <Badge
              variant="outline"
              className="text-xs border-purple-500/30 text-purple-400"
            >
              مجلد {work.volumeNumber}
            </Badge>
          )}
          {work.arc && (
            <Badge
              variant="outline"
              className="text-xs border-green-500/30 text-green-400"
            >
              {work.arc}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {work.description && (
          <p className="text-gray-300 text-sm line-clamp-3 mb-4">
            {work.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2 text-xs mb-4">
          <div className="flex items-center gap-1 text-gray-400">
            <Calendar className="w-3 h-3" />
            <span>{work.publishYear || "غير محدد"}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <BookOpen className="w-3 h-3" />
            <span>{work.pages || 0} صفحة</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <Clock className="w-3 h-3" />
            <span>{work.pages ? Math.round(work.pages / 2) : 0} دقيقة</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <Eye className="w-3 h-3" />
            <span>{work.readProgress || 0}%</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => handleReadWork(work)}
            className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-sm"
          >
            <BookOpen className="w-3 h-3 ml-1" />
            قراءة
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadAttempt}
            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            <Download className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const WorkListItem: React.FC<{ work: PDFWork }> = ({ work }) => (
    <Card className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-1 h-16 bg-gradient-to-b ${work.coverColor || getSeriesColor(work.series)} rounded-full`}
          />

          <div className="flex-1">
            <h3 className="text-lg font-bold text-white hover:text-cyan-400 cursor-pointer">
              {work.titleAr}
            </h3>
            <p className="text-gray-400 text-sm">{work.titleEn}</p>

            <div className="flex flex-wrap gap-2 mt-2">
              <Badge
                variant="outline"
                className="text-xs border-cyan-500/30 text-cyan-400"
              >
                {work.series}
              </Badge>
              {work.volumeNumber && (
                <Badge
                  variant="outline"
                  className="text-xs border-purple-500/30 text-purple-400"
                >
                  مجلد {work.volumeNumber}
                </Badge>
              )}
              <Badge
                variant="secondary"
                className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs"
              >
                ⭐ {work.rating}
              </Badge>
            </div>
          </div>

          <div className="text-right text-sm text-gray-400">
            <p>{work.publishYear || "غير محدد"}</p>
            <p>{work.pages || 0} صفحة</p>
            <p>{work.readProgress || 0}% مكتمل</p>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              onClick={() => handleReadWork(work)}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
            >
              <BookOpen className="w-4 h-4 ml-2" />
              قراءة
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadAttempt}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
                📚 مكتبة الأعمال المحمية
              </h1>
              <p className="text-gray-400">
                مجموعة شاملة من الأعمال المترجمة بجودة عالية
              </p>
            </div>
            <div className="flex items-center gap-2">
              <AuthButton />
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="text-white hover:text-cyan-400"
              >
                <ArrowLeft className="w-4 h-4 ml-2" />
                الرئيسية
              </Button>
            </div>
          </div>

          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-black/40 backdrop-blur-xl border border-cyan-500/30">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-cyan-400">
                  {stats.totalWorks}
                </div>
                <div className="text-sm text-gray-400">إجمالي الأعمال</div>
              </CardContent>
            </Card>
            <Card className="bg-black/40 backdrop-blur-xl border border-purple-500/30">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {stats.totalSeries}
                </div>
                <div className="text-sm text-gray-400">السلاسل</div>
              </CardContent>
            </Card>
            <Card className="bg-black/40 backdrop-blur-xl border border-green-500/30">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400">
                  {stats.totalPages.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">إجمالي الصفحات</div>
              </CardContent>
            </Card>
            <Card className="bg-black/40 backdrop-blur-xl border border-yellow-500/30">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {stats.averageRating.toFixed(1)}
                </div>
                <div className="text-sm text-gray-400">التقييم المتوسط</div>
              </CardContent>
            </Card>
          </div>
        </header>

        {/* أدوات البحث والتصفية */}
        <div className="mb-8">
          <Card className="bg-black/40 backdrop-blur-xl border border-cyan-500/30">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="البحث في الأعمال..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-4 pr-10 bg-black/40 border-gray-500/30 text-white placeholder-gray-400"
                  />
                </div>

                <select
                  value={selectedSeries}
                  onChange={(e) => {
                    setSelectedSeries(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 bg-black/40 border border-gray-500/30 rounded-md text-white focus:border-cyan-400 focus:outline-none"
                >
                  <option value="all">جميع السلاسل</option>
                  {seriesList.map((series) => (
                    <option key={series} value={series}>
                      {series}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedArc}
                  onChange={(e) => {
                    setSelectedArc(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 bg-black/40 border border-gray-500/30 rounded-md text-white focus:border-cyan-400 focus:outline-none"
                >
                  <option value="all">جميع الأقواس</option>
                  {arcsList.map((arc) => (
                    <option key={arc} value={arc}>
                      {arc}
                    </option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 bg-black/40 border border-gray-500/30 rounded-md text-white focus:border-cyan-400 focus:outline-none"
                >
                  <option value="title">ترتيب حسب العنوان</option>
                  <option value="rating">ترتيب حسب التقييم</option>
                  <option value="year">ترتيب حسب السنة</option>
                  <option value="pages">ترتيب حسب الصفحات</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="text-white"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="text-white"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>

                <p className="text-gray-400 text-sm">
                  عرض {paginatedWorks.length} من {filteredWorks.length} عمل
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* عرض الأعمال */}
        {filteredWorks.length === 0 ? (
          <Card className="bg-black/40 backdrop-blur-xl border border-gray-500/30">
            <CardContent className="p-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                لا توجد نتائج
              </h3>
              <p className="text-gray-400">
                جرب تغيير معايير البحث أو المرشحات
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {paginatedWorks.map((work) => (
                  <WorkCard key={work.id} work={work} />
                ))}
              </div>
            ) : (
              <div className="space-y-4 mb-8">
                {paginatedWorks.map((work) => (
                  <WorkListItem key={work.id} work={work} />
                ))}
              </div>
            )}

            {/* التنقل بين الصفحات */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                >
                  السابق
                </Button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                >
                  التالي
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PDFWorksLibrary;
