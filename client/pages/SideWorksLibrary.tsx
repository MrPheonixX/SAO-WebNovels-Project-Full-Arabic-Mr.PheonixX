import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  BookOpen,
  Play,
  Globe,
  Heart,
  Star,
  Clock,
  Trophy,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Mock data for side works
const sideWorks = [
  {
    id: "nhk",
    title: "Welcome to the NHK",
    titleArabic: "مرحباً بكم في NHK",
    titleJapanese: "NHK にようこそ！",
    author: "Tatsuhiko Takimoto",
    authorArabic: "تاتسوهيكو تاكيموتو",
    description:
      "A dark psychological novel exploring themes of social withdrawal, depression, and the struggles of modern Japanese society through the eyes of a hikikomori.",
    descriptionArabic:
      "رواية نفسية مظلمة تستكشف مواضيع الانعزال الاجتماعي والاكتئاب وصراعات المجتمع الياباني الحديث من خلال عيون هيكيكوموري.",
    genre: "Psychological Drama",
    genreArabic: "دراما نفسية",
    pages: 320,
    status: "available",
    rating: 4.5,
    readProgress: 0,
    coverColor: "from-gray-700 to-gray-900",
    tags: ["نفسي", "اجتماعي", "ياباني", "واقعي"],
    publishYear: 2002,
    difficulty: "متوسط",
  },
  {
    id: "no-longer-human",
    title: "No Longer Human",
    titleArabic: "لم أعد إنساناً",
    titleJapanese: "人間失格",
    author: "Osamu Dazai",
    authorArabic: "أوسامو دازاي",
    description:
      "A classic Japanese literary work that explores themes of alienation, mental illness, and the human condition through the confessions of a troubled protagonist.",
    descriptionArabic:
      "عمل أدبي ياباني كلاسيكي يستكشف مواضيع الاغتراب والمرض النفسي والحالة الإنسانية من خلال اعترافات بطل مضطرب.",
    genre: "Literary Fiction",
    genreArabic: "أدب خيالي",
    pages: 280,
    status: "available",
    rating: 4.8,
    readProgress: 0,
    coverColor: "from-amber-700 to-amber-900",
    tags: ["كلاسيكي", "أدبي", "فلسفي", "ياباني"],
    publishYear: 1948,
    difficulty: "متقدم",
  },
];

export default function SideWorksLibrary() {
  const navigate = useNavigate();
  const [selectedWork, setSelectedWork] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all");

  const filteredWorks = sideWorks.filter((work) => {
    const matchesSearch =
      work.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      work.titleArabic.includes(searchQuery) ||
      work.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterBy === "all" ||
      (filterBy === "available" && work.status === "available") ||
      (filterBy === "reading" && work.readProgress > 0);
    return matchesSearch && matchesFilter;
  });

  const handleWorkSelect = (workId: string) => {
    setSelectedWork(workId);
    navigate(`/reader/sidework/${workId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gray-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-slate-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="border-b border-gray-500/20 bg-black/20 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="text-gray-400 hover:text-gray-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                العودة للرئيسية
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-300 flex items-center gap-2">
                  <Globe className="w-6 h-6" />
                  الأعمال الإضافية
                </h1>
                <p className="text-sm text-gray-400">Side Literary Works</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Badge
                variant="outline"
                className="border-amber-400 text-amber-400"
              >
                <Trophy className="w-3 h-3 mr-1" />
                أعمال مختارة
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Info Banner */}
        <div className="mb-8 p-6 bg-gradient-to-r from-gray-600/20 to-slate-600/20 border border-gray-500/30 rounded-lg backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-gray-300 mb-3">
            أعمال أدبية مختارة
          </h2>
          <p className="text-gray-300 leading-relaxed">
            مجموعة من الأعمال الأدبية اليابانية المميزة مترجمة بعناية فائقة. هذه
            الأعمال تقدم نظرة عميقة على الثقافة والمجتمع الياباني من خلال قصص
            مؤثرة وشخصيات معقدة. كل عمل يحمل في طياته فلسفة وتجربة إنسانية
            فريدة.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="secondary">أدب ياباني</Badge>
            <Badge variant="secondary">ترجمة احترافية</Badge>
            <Badge variant="secondary">محتوى نفسي</Badge>
            <Badge variant="secondary">فلسفة عميقة</Badge>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="البحث في الأعمال... Search works..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 bg-black/40 border border-gray-500/30 rounded-md text-white placeholder-gray-400 focus:border-gray-400 focus:outline-none"
            />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-4 py-2 bg-black/40 border border-gray-500/30 rounded-md text-white focus:border-gray-400 focus:outline-none"
            >
              <option value="all">كل الأعمال</option>
              <option value="available">متاح</option>
              <option value="reading">قيد القراءة</option>
            </select>
          </div>
        </div>

        {/* Works Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {filteredWorks.map((work) => (
            <Card
              key={work.id}
              className="bg-black/40 border-gray-500/30 backdrop-blur-sm hover:border-gray-400/50 transition-all duration-300 cursor-pointer group relative overflow-hidden"
              onClick={() =>
                work.status === "available" ? handleWorkSelect(work.id) : null
              }
            >
              {/* Gradient overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${work.coverColor}/10 group-hover:${work.coverColor.replace("/10", "/20")} transition-all`}
              ></div>

              <CardHeader className="p-6 relative z-10">
                <div
                  className={`aspect-[3/4] bg-gradient-to-b ${work.coverColor} rounded-md mb-4 flex flex-col items-center justify-center relative overflow-hidden`}
                >
                  <div className="text-center p-6">
                    <BookOpen className="w-16 h-16 text-white/80 mb-4" />
                    <h3 className="text-white font-bold text-lg mb-2">
                      {work.titleJapanese}
                    </h3>
                    <p className="text-white/70 text-sm">{work.publishYear}</p>
                  </div>

                  <div className="absolute top-3 right-3">
                    <Badge className="bg-black/50 text-white">
                      {work.difficulty}
                    </Badge>
                  </div>
                </div>

                <CardTitle className="text-xl text-gray-300 mb-2">
                  {work.titleArabic}
                </CardTitle>
                <CardTitle className="text-lg text-gray-400 mb-2 font-normal">
                  {work.title}
                </CardTitle>
                <CardDescription className="text-gray-400 text-sm">
                  بقلم: {work.authorArabic} ({work.author})
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 pt-0 relative z-10">
                <div className="space-y-4">
                  {/* Description */}
                  <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
                    {work.descriptionArabic}
                  </p>

                  {/* Genre and Rating */}
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className="border-gray-400 text-gray-400"
                    >
                      {work.genreArabic}
                    </Badge>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-gray-300 text-sm">
                        {work.rating}
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {work.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="border-gray-500 text-gray-400 text-xs px-2 py-1"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Progress Bar */}
                  {work.readProgress > 0 && (
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>التقدم</span>
                        <span>{work.readProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-gray-400 to-gray-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${work.readProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {work.pages} صفحة
                    </span>
                    <span>{work.publishYear}</span>
                  </div>

                  {/* Action Button */}
                  {work.status === "available" ? (
                    <Button
                      className="w-full bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-500 hover:to-slate-500 group-hover:scale-105 transition-all"
                      size="sm"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {work.readProgress > 0
                        ? "متابعة القراءة"
                        : "ابدأ القراءة"}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full border-gray-400 text-gray-400"
                      disabled
                      size="sm"
                    >
                      قريباً
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Literary Context Section */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center mb-8 text-gray-300">
            السياق الأدبي والثقافي
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border-amber-500/30">
              <CardContent className="p-6">
                <h4 className="text-xl font-bold text-amber-300 mb-3">
                  الأدب الياباني الحديث
                </h4>
                <p className="text-gray-300 leading-relaxed">
                  هذه الأعمال تمثل جوانب مختلفة من الأدب الياباني الحديث، من
                  ال��لاسيكيات التي شكلت الهوية الأدبية اليابانية إلى الأعمال
                  المعاصرة التي تعكس تحديات المجتمع الحديث.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-900/20 to-slate-900/20 border-gray-500/30">
              <CardContent className="p-6">
                <h4 className="text-xl font-bold text-gray-300 mb-3">
                  الترجمة والمراجعة
                </h4>
                <p className="text-gray-300 leading-relaxed">
                  تم ترجمة هذه الأعمال بعناية فائقة مع الحفاظ على الجوهر الثقافي
                  والأدبي للنصوص الأصلية، مع إضافة تفسيرات ثقافية عند الحاجة
                  لتسهيل الفهم للقارئ العربي.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reading Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-r from-amber-600/20 to-yellow-600/20 border-amber-400/50">
            <CardContent className="p-6 text-center">
              <h3 className="text-2xl font-bold text-amber-300">
                {sideWorks.filter((w) => w.status === "available").length}
              </h3>
              <p className="text-gray-300">أعمال متاحة</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-gray-600/20 to-slate-600/20 border-gray-400/50">
            <CardContent className="p-6 text-center">
              <h3 className="text-2xl font-bold text-gray-300">
                {sideWorks.reduce((acc, w) => acc + w.pages, 0)}
              </h3>
              <p className="text-gray-300">إجمالي الصفحات</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-slate-600/20 to-gray-600/20 border-slate-400/50">
            <CardContent className="p-6 text-center">
              <h3 className="text-2xl font-bold text-slate-300">
                {(
                  sideWorks.reduce((acc, w) => acc + w.rating, 0) /
                  sideWorks.length
                ).toFixed(1)}
              </h3>
              <p className="text-gray-300">متوسط التقييم</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
